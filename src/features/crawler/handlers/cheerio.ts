import * as cheerio from 'cheerio';
import Denque from 'denque';
import InternalServer from 'src/core/error/internal-server.error';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';

class Cheerio {
  private url: string;
  private processedUrls: Set<string> = new Set();
  private pendingUrlsSet: Set<string> = new Set();
  private pendingUrlsQueue: Denque<string>;
  private maxConcurrentRequests: number = 10;
  private depth: number | undefined;
  private activeRequests: number = 0;
  private domainOnly: boolean = true;

  constructor(
    private readonly loggerService: LoggingService,
    url: string,
    options?: {
      maxConcurrentRequests?: number;
      domainOnly?: boolean;
      depth?: number;
    },
  ) {
    this.url = url;

    if (options?.maxConcurrentRequests)
      this.maxConcurrentRequests = options.maxConcurrentRequests;
    if (options?.domainOnly !== undefined) this.domainOnly = options.domainOnly;
    if (options?.depth !== undefined) this.depth = options.depth;

    this.pendingUrlsQueue = new Denque();
  }

  public static fromUrl(
    loggerService: LoggingService,
    url: string,
    options?: {
      maxConcurrentRequests?: number;
      domainOnly?: boolean;
      depth?: number;
    },
  ): Cheerio {
    return new Cheerio(loggerService, url, options);
  }

  public async crawl(): Promise<void> {
    const loggerData: ILoggerData = {
      serviceName: 'Cheerio',
      function: 'crawl',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      this.processedUrls.add(this.url);
      this.pendingUrlsSet.add(this.url);
      this.pendingUrlsQueue.push(this.url);

      await this.processQueue();

      this.loggerService.info({ ...loggerData, message: 'executed' });
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw error;
    }
  }

  private async processQueue(): Promise<void> {
    const loggerData: ILoggerData = {
      serviceName: 'Cheerio',
      function: 'processQueue',
      message: 'executing',
    };

    try {
      while (this.pendingUrlsQueue.length > 0) {
        const batchSize = Math.min(
          this.maxConcurrentRequests,
          this.pendingUrlsQueue.length,
        );
        const urlBatch: string[] = [];

        // Extract a batch of URLs to process
        for (let i = 0; i < batchSize; i++) {
          const url = this.pendingUrlsQueue.shift()!;
          this.pendingUrlsSet.delete(url);
          urlBatch.push(url);
        }

        this.loggerService.debug({
          ...loggerData,
          message: `Processing batch of ${urlBatch.length} URLs`,
        });

        // Process the batch in parallel
        await Promise.all(urlBatch.map((url) => this.processUrl(url)));

        // Small delay to prevent potential resource issues
        if (this.pendingUrlsQueue.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      this.loggerService.info({ ...loggerData, message: 'executed' });
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw error;
    }
  }

  private async processUrl(url: string): Promise<void> {
    const loggerData: ILoggerData = {
      serviceName: 'Cheerio',
      function: 'processUrl',
      message: 'executing',
    };

    try {
      this.loggerService.debug({
        ...loggerData,
        message: `Processing URL: ${url}`,
      });

      const urlDomain = new URL(url);
      const $ = await cheerio.fromURL(urlDomain.href);

      const extractedUrls = $('a')
        .filter((_, element) => {
          const href = $(element).attr('href');

          if (!href || (!href.startsWith('/') && !href.startsWith('http')))
            return false;

          const hrefDomain = new URL(href, urlDomain.origin);

          if (this.domainOnly && urlDomain.hostname !== hrefDomain.hostname) {
            return false;
          }

          if (this.depth) {
            const hrefDepth =
              hrefDomain.pathname.split('/').filter((it) => it.length).length +
              1;
            if (hrefDepth > this.depth) {
              return false;
            }
          }

          return true;
        })
        .map((_, element) =>
          new URL($(element).attr('href')!, urlDomain.origin).href.replace(
            /\/$/,
            '',
          ),
        )
        .get();

      this.loggerService.debug({
        ...loggerData,
        message: `Found ${extractedUrls.length} URLs from ${url}`,
      });

      // Only add URLs that haven't been processed or aren't already in the queue
      for (const extractedUrl of extractedUrls) {
        if (
          !this.processedUrls.has(extractedUrl) &&
          !this.pendingUrlsSet.has(extractedUrl)
        ) {
          this.processedUrls.add(extractedUrl);
          this.pendingUrlsSet.add(extractedUrl);
          this.pendingUrlsQueue.push(extractedUrl);
        }
      }

      this.loggerService.info({ ...loggerData, message: 'executed' });
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw error;
    }
  }

  public getProcessedUrls(): string[] {
    return Array.from(this.processedUrls);
  }

  public async extractContent(url?: string): Promise<string> {
    const loggerData: ILoggerData = {
      serviceName: 'Cheerio',
      function: 'extractContent',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const $ = await cheerio.fromURL(url ?? this.url);

      // Remove script and style elements
      $('script, style, noscript, iframe').remove();

      // Extract text from the body
      let text = $('body').text();

      // Clean up the text:
      // 1. Replace multiple newlines with a single newline
      // 2. Replace multiple spaces with a single space
      // 3. Remove leading/trailing whitespace
      text = text
        .replace(/\n\s*\n/g, '\n') // Replace multiple newlines (and any spaces between them) with single newline
        .replace(/[\t\f\r ]+/g, ' ') // Replace multiple horizontal whitespace with single space
        .trim(); // Remove leading/trailing whitespace

      this.loggerService.debug({
        ...loggerData,
        message: `Extracted ${text.length} characters of content from ${url}`,
      });

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return text;
    } catch (error) {
      this.loggerService.error(
        {
          ...loggerData,
          message: `Failed to extract content from ${url}`,
        },
        { error },
      );

      throw new InternalServer('Failed to extract content');
    }
  }

  // Optional: Add a method to extract content with more control over the elements to extract from
  public async extractContentFromSelectors(
    url: string,
    selectors: string[] = ['body'],
  ): Promise<string> {
    const loggerData: ILoggerData = {
      serviceName: 'Cheerio',
      function: 'extractContentFromSelectors',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const urlDomain = new URL(url);
      const $ = await cheerio.fromURL(urlDomain.href);

      // Remove unwanted elements
      $('script, style, noscript, iframe').remove();

      // Extract text from specified selectors
      const texts = selectors.map((selector) => {
        try {
          return $(selector).text() || '';
        } catch (err) {
          this.loggerService.warn({
            ...loggerData,
            message: `Failed to extract content from selector: ${selector}`,
          });
          return '';
        }
      });

      // Combine and clean the text
      let text = texts
        .join('\n')
        .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
        .replace(/[\t\f\r ]+/g, ' ') // Replace multiple horizontal whitespace with single space
        .trim(); // Remove leading/trailing whitespace

      this.loggerService.debug({
        ...loggerData,
        message: `Extracted ${text.length} characters using ${selectors.length} selectors from ${url}`,
      });

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return text;
    } catch (error) {
      this.loggerService.error(
        {
          ...loggerData,
          message: `Failed to extract content from ${url}`,
        },
        { error },
      );

      throw new InternalServer('Failed to extract content');
    }
  }
}

export { Cheerio };
