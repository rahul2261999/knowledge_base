import { BadRequestException } from '@nestjs/common';
import {
  SiteMapIndexes,
  SiteMaps,
  SiteMapServiceMethods,
} from './sitemap.interface';
import { Parser, ParserOptions } from 'xml2js';
import InternalServer from 'src/core/error/internal-server.error';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';

class Sitemap implements SiteMapServiceMethods {
  private url: URL;
  private sitemap: SiteMapIndexes | SiteMaps | undefined;

  private constructor(
    url: URL,
    private readonly loggerService: LoggingService,
  ) {
    this.url = url;
  }

  public static async fromUrl(
    url: URL,
    loggerService: LoggingService,
  ): Promise<SiteMapServiceMethods> {
    const loggerData: ILoggerData = {
      serviceName: 'Sitemap',
      function: 'fromUrl',
      message: 'executing',
    };

    try {
      loggerService.info(loggerData);

      if (!url || !(url instanceof URL)) {
        throw new BadRequestException('Invalid URL provided');
      }

      const sitemap = new Sitemap(url, loggerService);
      sitemap.sitemap = await sitemap.fetch();

      loggerService.info({ ...loggerData, message: 'executed' });

      return sitemap;
    } catch (error) {
      loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('Failed to create sitemap from URL');
    }
  }

  private async fetch(
    url?: URL,
  ): Promise<SiteMapIndexes | SiteMaps | undefined> {
    const loggerData: ILoggerData = {
      serviceName: 'Sitemap',
      function: 'fetch',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const mainUrl = url || this.url;
      const sitemapUrl = mainUrl.origin + '/sitemap.xml';
      const response = await fetch(sitemapUrl);

      if (!response.ok) {
        this.loggerService.debug({
          ...loggerData,
          message: `Failed to fetch sitemap from ${sitemapUrl}. Status code: ${response.status}`,
        });

        return undefined;
      }

      const sitemapContent = await response.text();

      // Type-safe XML parser configuration
      const xmlParserConfig: ParserOptions = {
        explicitArray: false,
        strict: false,
        tagNameProcessors: [(name: string) => name.toLowerCase()],
      } as const;

      const xmlParser = new Parser(xmlParserConfig);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsedData = await xmlParser.parseStringPromise(sitemapContent);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return parsedData as SiteMapIndexes | SiteMaps | undefined;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer(
        'something went wrong while fetching the sitemap',
      );
    }
  }

  public checkSiteMapIndexes(): boolean {
    const loggerData: ILoggerData = {
      serviceName: 'Sitemap',
      function: 'checkSiteMapIndexes',
      message: 'executing',
    };

    this.loggerService.info(loggerData);

    const siteMapIndexes = this.sitemap as SiteMapIndexes;

    if (
      siteMapIndexes &&
      siteMapIndexes.sitemapindex &&
      siteMapIndexes.sitemapindex.sitemap &&
      siteMapIndexes.sitemapindex.sitemap.length > 0
    ) {
      this.loggerService.info({ ...loggerData, message: 'executed' });
      return true;
    }

    this.loggerService.info({ ...loggerData, message: 'executed' });
    return false;
  }

  public checkSiteMaps(): boolean {
    const loggerData: ILoggerData = {
      serviceName: 'Sitemap',
      function: 'checkSiteMaps',
      message: 'executing',
    };

    this.loggerService.info(loggerData);

    const siteMaps = this.sitemap as SiteMaps;

    if (
      siteMaps &&
      siteMaps.urlset &&
      siteMaps.urlset.url &&
      siteMaps.urlset.url.length > 0
    ) {
      this.loggerService.info({ ...loggerData, message: 'executed' });
      return true;
    }

    this.loggerService.info({ ...loggerData, message: 'executed' });
    return false;
  }

  public getSiteMapIndexes(): SiteMapIndexes | null {
    const loggerData: ILoggerData = {
      serviceName: 'Sitemap',
      function: 'getSiteMapIndexes',
      message: 'executing',
    };

    this.loggerService.info(loggerData);

    const sitemapIndexesExist = this.checkSiteMapIndexes();
    let sitemapIndexes: SiteMapIndexes | null = null;

    if (sitemapIndexesExist) {
      sitemapIndexes = this.sitemap as SiteMapIndexes;
    }

    this.loggerService.info({ ...loggerData, message: 'executed' });

    return sitemapIndexes;
  }

  public getSiteMaps(): SiteMaps | null {
    const loggerData: ILoggerData = {
      serviceName: 'Sitemap',
      function: 'getSiteMaps',
      message: 'executing',
    };

    this.loggerService.info(loggerData);

    const sitemapsExist = this.checkSiteMaps();
    let sitemaps: SiteMaps | null = null;

    if (sitemapsExist) {
      sitemaps = this.sitemap as SiteMaps;
    }

    this.loggerService.info({ ...loggerData, message: 'executed' });

    return sitemaps;
  }
}

export { Sitemap };
