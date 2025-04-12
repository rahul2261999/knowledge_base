import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  SiteMapIndexes,
  SiteMaps,
  SiteMapServiceMethods,
} from './sitemap.interface';
import { Parser } from 'xml2js';

class Sitemap implements SiteMapServiceMethods {
  private url: URL;
  private sitemap: SiteMapIndexes | SiteMaps | undefined;

  private constructor(url: URL) {
    this.url = url;
  }

  public static async fromUrl(url: URL): Promise<SiteMapServiceMethods> {
    try {
      Logger.log('executing: Sitemap -> fromUrl');

      if (!url || !(url instanceof URL)) {
        throw new BadRequestException('Invalid URL provided');
      }

      const sitemap = new Sitemap(url);
      sitemap.sitemap = await sitemap.fetch();

      Logger.log('executed: Sitemap -> fromUrl');

      return sitemap;
    } catch (error) {
      Logger.error('failed: Sitemap -> fromUrl');
      Logger.error(error, error?.stack);

      throw new InternalServerErrorException(
        'Failed to create sitemap from URL',
        {
          cause: error,
          description: error.message,
        },
      );
    }
  }

  private async fetch(
    url?: URL,
  ): Promise<SiteMapIndexes | SiteMaps | undefined> {
    try {
      Logger.log('executing: Sitemap -> fetch');

      const mainUrl = url || this.url;

      const sitemapUrl = mainUrl.origin + '/sitemap.xml';

      const response = await fetch(sitemapUrl);

      if (!response.ok) {
        Logger.debug(
          `Failed to fetch sitemap from ${sitemapUrl}. Status code: ${response.status}`,
        );

        return undefined;
      }

      const sitemapContent = await response.text();

      const xmlParser = new Parser({
        explicitArray: false,
        strict: false,
        tagNameProcessors: [(name) => name.toLowerCase()],
      });
      const parsedData = await xmlParser.parseStringPromise(sitemapContent);

      Logger.log('executed: Sitemap -> fetch');

      return parsedData;
    } catch (error) {
      Logger.error('failed: Sitemap -> fromUrl');
      Logger.error(error.message, error.stack);

      throw new InternalServerErrorException(
        'something went wrong while fetching the sitemap',
        {
          cause: error,
          description: error.message,
        },
      );
    }
  }

  public checkSiteMapIndexes(): boolean {
    Logger.log('executing: Sitemap -> checkSiteMapIndexes');

    const siteMapIndexes = this.sitemap as SiteMapIndexes;

    if (
      siteMapIndexes &&
      siteMapIndexes.sitemapindex &&
      siteMapIndexes.sitemapindex.sitemap &&
      siteMapIndexes.sitemapindex.sitemap.length > 0
    ) {
      return true;
    }

    Logger.log('executed: Sitemap -> checkSiteMapIndexes');

    return false;
  }

  public checkSiteMaps(): boolean {
    Logger.log('executing: Sitemap -> checkSiteMaps');

    const siteMaps = this.sitemap as SiteMaps;

    if (
      siteMaps &&
      siteMaps.urlset &&
      siteMaps.urlset.url &&
      siteMaps.urlset.url.length > 0
    ) {
      return true;
    }

    Logger.log('executed: Sitemap -> checkSiteMaps');

    return false;
  }

  public getSiteMapIndexes(): SiteMapIndexes | null {
    Logger.log('executing: Sitemap -> getSiteMapIndexes');

    const sitemapIndexesExist = this.checkSiteMapIndexes();
    let sitemapIndexes: SiteMapIndexes | null = null;

    if (sitemapIndexesExist) {
      sitemapIndexes = this.sitemap as SiteMapIndexes;
    }

    Logger.log('executed: Sitemap -> getSiteMapIndexes');

    return sitemapIndexes;
  }
  public getSiteMaps(): SiteMaps | null {
    Logger.log('executing: Sitemap -> getSiteMaps');

    const sitemapsExist = this.checkSiteMaps();
    let sitemaps: SiteMaps | null = null;

    if (sitemapsExist) {
      sitemaps = this.sitemap as SiteMaps;
    }

    Logger.log('executed: Sitemap -> getSiteMaps');

    return sitemaps;
  }
}

export { Sitemap };
