import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CrawlDto } from './dto/crawler.dto';
import {
  CrawlContentQueuePayload,
  Crawling,
  ExtractedUrl,
} from './crawler.interface';
import { Cheerio } from './handlers/cheerio';
import { Sitemap } from 'src/lib/sitemap/sitemap.util';
import mongoose from 'mongoose';
import { CrawlingSessionRepo } from './repo/crawling-session.repo';
import { CrawledUrl } from './schemas/crawled-url.model';
import { CrawledUrlRepo } from './repo/crawled-url.repo';
import { CrawlingSessionDocument } from './schemas/crawling-session.model';
import {
  CrawledUrlStatus,
  CrawlingSessionStatus,
} from 'src/core/constants/global.enum';

@Injectable()
export class CrawlerService {
  constructor(
    private crawlingSessionRepo: CrawlingSessionRepo,
    private crawledUrlRepo: CrawledUrlRepo,
  ) {}

  async crawl(params: CrawlDto): Promise<CrawlingSessionDocument> {
    try {
      Logger.log('executing: CrawlerService -> crawl');

      await this.crawlingSessionRepo.updateOne(
        {
          websiteId: new mongoose.Types.ObjectId(params.websiteId),
          active: true,
        },
        {
          active: false,
        },
      );

      const createCrawlingSession = await this.crawlingSessionRepo.create({
        websiteId: params.websiteId,
        totalUrls: 0,
        urlsCrawled: null,
        failureReason: null,
        active: true,
        status: CrawlingSessionStatus.IN_PROGRESS,
      });

      this.determineCrawlingStrategy({
        crawlingSessionId: createCrawlingSession._id.toString(),
        url: new URL(params.url),
        depth: params.depth,
      });

      Logger.log('executed: CrawlerService -> crawl');

      return createCrawlingSession;
    } catch (error) {
      Logger.error('error: CrawlerService -> crawl');
      Logger.error(error.message, error);

      throw new InternalServerErrorException(error.message, {
        cause: error,
        description: 'Error in crawler service',
      });
    }
  }

  private async determineCrawlingStrategy(params: Crawling): Promise<void> {
    try {
      Logger.log('executing CrawlerService -> determineCrawlingStrategy');

      const mainUrl = new URL(params.url);
      const sitemap = await Sitemap.fromUrl(mainUrl);

      let data: { totalUrls: number };

      if (sitemap.checkSiteMaps()) {
        const extractedUrls: ExtractedUrl[] = sitemap
          .getSiteMaps()!
          .urlset.url.map((it) => {
            return {
              url: it.loc,
              lastModified: it.lastmod,
              changeFrequency: it.changefreq
                ? parseFloat(it.changefreq)
                : undefined,
              priority: it.priority,
            };
          });

        data = await this.processExtractedUrl(extractedUrls, params);
      } else {
        data = await this.crawlWebsite(params);
      }

      await this.crawlingSessionRepo.updateOne(
        { _id: new mongoose.Types.ObjectId(params.crawlingSessionId) },
        { totalUrls: data.totalUrls },
      );

      Logger.log('executing CrawlerService -> determineCrawlingStrategy');
    } catch (error) {
      Logger.error('error: CrawlerService -> determineCrawlingStrategy');
      Logger.error(error.message, error?.stack);
    }
  }

  private async crawlWebsite(params: Crawling): Promise<{ totalUrls: number }> {
    try {
      Logger.log('executing CrawlerService -> crawlWebsite');

      const cheerioClient = Cheerio.fromUrl(params.url.href, {
        domainOnly: true,
        depth: params.depth,
      });

      await cheerioClient.crawl();

      const processedUrls = cheerioClient.getProcessedUrls();

      const extractedUrls: ExtractedUrl[] = processedUrls.map((it) => {
        return {
          url: it,
        };
      });

      await this.processExtractedUrl(extractedUrls, params);

      Logger.log('executed CrawlerService -> crawlWebsite');

      return {
        totalUrls: processedUrls.length,
      };
    } catch (error) {
      Logger.error('Error in CrawlerService -> crawlWebsite', error);

      throw new InternalServerErrorException('Error crawling by URL', {
        cause: error,
        description: error.message,
      });
    }
  }

  private async processExtractedUrl(
    extractedUrls: ExtractedUrl[],
    params: Crawling,
  ) {
    try {
      Logger.log('executing: CrawlerService -> processExtractedUrl');

      const bulkCreateCrawleddUrl: CrawledUrl[] = extractedUrls.map(
        (extractedUrl) => {
          const data: CrawledUrl = {
            url: extractedUrl.url,
            crawlingSessionId: new mongoose.Types.ObjectId(
              params.crawlingSessionId,
            ),
            status: CrawledUrlStatus.PENDING,
          };

          return data;
        },
      );

      const bulkCreatedCrawleddUrl = await this.crawledUrlRepo.bulkCreate(
        bulkCreateCrawleddUrl,
      );

      // let iteration = 0;
      // let batchSize = Math.min(bulkCreatedCrawleddUrl.length, 200);
      // let queueJobs: AddBulkJobs<CrawlContentQueuePayload>[] = [];

      // while (iteration < bulkCreatedCrawleddUrl.length) {
      //   const currentData = bulkCreatedCrawleddUrl[iteration];

      //   queueJobs.push({
      //     name: params.crawlingSessionId,
      //     data: {
      //       url: currentData.url,
      //       crawlingSessionId: params.crawlingSessionId,
      //       crawlingUrlId: currentData._id.toString(),
      //     },
      //     opts: {
      //       attempts: 3,
      //       backoff: { type: 'exponential', delay: 1000, maxDelay: 60000 },
      //     } as BulkJobOptions,
      //   });

      //   if (queueJobs.length === batchSize) {
      //     this.crawlContentQueue.addBulk(queueJobs);
      //     queueJobs = [];
      //   }

      //   iteration++;
      // }

      Logger.log('executed: CrawlerService -> processExtractedUrl');

      return { totalUrls: bulkCreateCrawleddUrl.length };
    } catch (error) {
      Logger.error('Error in CrawlerService -> processExtractedUrl', error);

      throw new InternalServerErrorException(error.message, {
        cause: error,
        description: 'Error getting sitemap URLs',
      });
    }
  }

  // private async processSitemapIndex(sitemapIndexes: SiteMapIndexes, param: Crawling) {
  //   try {
  //     Logger.log('executing: CrawlerService -> getSitemapIndexURLs');

  //     const sitemapEntries = sitemapIndexes.sitemapindex.sitemap;

  //     let totalUrls = 0

  //     for (let i = 0; i < sitemapEntries.length; i += 5) {
  //       const batchEntries = sitemapEntries.slice(i, i + 5);

  //       const batchPromise = batchEntries.map(async (entries) => {
  //         const sitemapClient = await Sitemap.fromUrl(new URL(entries.loc));

  //         if (sitemapClient.checkSiteMaps()) {]

  //           const extractedUrls: ExtractedUrl[] = sitemapClient.ex
  //           const data = await this.processExtractedUrl(sitemapClient.getSiteMaps()!, param);

  //           totalUrls += data.totalUrls
  //         }
  //       });

  //       await Promise.all(batchPromise);
  //     }

  //     Logger.log('executed: CrawlerService -> getSitemapIndexURLs');

  //     return { totalUrls };
  //   } catch (error) {
  //     Logger.error('Error in CrawlerService -> getSitemapIndexURLs', error);

  //     throw new InternalServerErrorException(error.message, {
  //       cause: error,
  //       description: 'Error getting sitemap index URLs',
  //     });
  //   }
  // }
}
