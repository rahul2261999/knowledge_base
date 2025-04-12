import { Logger } from "@nestjs/common";
import * as cheerio from 'cheerio';
import Denque from "denque";

class Cheerio {
  private url: string;
  private processedUrls: Set<string> = new Set();
  private pendingUrlsSet: Set<string> = new Set();
  private pendingUrlsQueue: Denque<string>;
  private maxConcurrentRequests: number = 10;
  private depth: number | undefined;
  private activeRequests: number = 0;
  private domainOnly: boolean = true;

  private constructor(url: string, options?: { maxConcurrentRequests?: number, domainOnly?: boolean, depth?: number }) {
    this.url = url;

    if (options?.maxConcurrentRequests) this.maxConcurrentRequests = options.maxConcurrentRequests;
    if (options?.domainOnly !== undefined) this.domainOnly = options.domainOnly;
    if (options?.depth !== undefined) this.depth = options.depth

    this.pendingUrlsQueue = new Denque();
  }

  public static fromUrl(url: string, options?: { maxConcurrentRequests?: number, domainOnly?: boolean, depth?: number }): Cheerio {
    return new Cheerio(url, options);
  }

  public async crawl(): Promise<void> {
    try {
      Logger.log('executing: Cheerio -> crawl');

      this.processedUrls.add(this.url);
      this.pendingUrlsSet.add(this.url);
      this.pendingUrlsQueue.push(this.url);

      await this.processQueue();

      Logger.log('executed: Cheerio -> crawl');
    } catch (error) {
      Logger.error('failed: Cheerio -> crawl', error);
    }
  }

  private async processQueue(): Promise<void> {
    try {
      while (this.pendingUrlsQueue.length > 0) {
        const batchSize = Math.min(this.maxConcurrentRequests, this.pendingUrlsQueue.length);
        const urlBatch: string[] = [];
        
        // Extract a batch of URLs to process
        for (let i = 0; i < batchSize; i++) {
          const url = this.pendingUrlsQueue.shift()!;
          this.pendingUrlsSet.delete(url);
          urlBatch.push(url);
        }
        
        // Process the batch in parallel
        await Promise.all(urlBatch.map(url => this.processUrl(url)));
        
        // Small delay to prevent potential resource issues
        if (this.pendingUrlsQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      Logger.error('failed: Cheerio -> processQueue', error);
    }
  }

  private async processUrl(url: string): Promise<void> {
    try {
      Logger.debug(`Processing url: ${url}`);

      const urlDomain = new URL(url);

      const $ = await cheerio.fromURL(urlDomain.href);

      const extractedUrls = $('a')
        .filter((_, element) => {
          const href = $(element).attr('href');

          if (!href || (!href.startsWith('/') && !href.startsWith('http'))) return false
          
          const hrefDomain = new URL(href, urlDomain.origin);

          if (this.domainOnly && urlDomain.hostname !== hrefDomain.hostname) {

            return false;
          }

          if (this.depth) {
            const hrefDepth = hrefDomain.pathname.split('/').filter(it => it.length).length + 1;

            if (hrefDepth > this.depth) {

              return false;
            }
          }

          return true;
        })
        .map((_, element) => new URL($(element).attr('href')!, urlDomain.origin).href.replace(/\/$/, ''))
        .get();

      Logger.debug(`Processing complete for url: ${url}`);

      // Only add URLs that haven't been processed or aren't already in the queue
      for (const extractedUrl of extractedUrls) {
        if (!this.processedUrls.has(extractedUrl) && !this.pendingUrlsSet.has(extractedUrl)) {
          this.processedUrls.add(extractedUrl);
          this.pendingUrlsSet.add(extractedUrl);
          this.pendingUrlsQueue.push(extractedUrl);
        }
      }

      return;
    } catch (error) {
      Logger.error(error);
    }
  }

  public getProcessedUrls(): string[] {
    return Array.from(this.processedUrls);
  }
}

export { Cheerio }