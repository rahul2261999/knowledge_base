import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CrawlDto } from './dto/crawler.dto';
import { Crawling, ExtractedUrl } from './crawler.interface';
import { Cheerio } from './handlers/cheerio';
import { Sitemap } from 'src/lib/sitemap/sitemap.util';
import mongoose, {
  AggregateOptions,
  AnyBulkWriteOperation,
  FilterQuery,
} from 'mongoose';
import { CrawlingSessionRepo } from './repo/crawling-session.repo';
import { CrawledUrl } from './schemas/crawled-url.model';
import { CrawledUrlRepo } from './repo/crawled-url.repo';
import {
  CrawlingSession,
  CrawlingSessionDocument,
} from './schemas/crawling-session.model';
import {
  CrawledUrlStatus,
  CrawlingSessionStatus,
} from 'src/core/constants/global.enum';
import { AwsSqsService } from 'src/lib/aws_sqs/aws-sqs.service';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import {
  CrawlContentQueueMessage,
  CrawlContentQueuePayload,
} from 'src/lib/aws_sqs/aws-sqs-interface';
import { ILoggerData } from 'src/lib/logger/logger.type';
import { LoggingService } from 'src/lib/logger/logger.service';
import InternalServer from 'src/core/error/internal-server.error';
import { AwsS3Service } from 'src/lib/aws_s3/aws-s3.service';
import { AlsService } from 'src/core/common/als/als.service';
import { ulid } from 'ulid';

@Injectable()
export class CrawlerService {
  constructor(
    private crawlingSessionRepo: CrawlingSessionRepo,
    private crawledUrlRepo: CrawledUrlRepo,
    private awsSqsService: AwsSqsService,
    private configurationService: ConfigurationService,
    private loggerService: LoggingService,
    private awsS3Service: AwsS3Service,
    private alSService: AlsService,
  ) {}

  async getCrawlingSession(
    crawlSession: FilterQuery<CrawlingSession>,
  ): Promise<CrawlingSessionDocument> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'getCrawlingSessionById',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const crawlingSession =
        await this.crawlingSessionRepo.findOne(crawlSession);

      if (!crawlingSession) {
        throw new InternalServerErrorException('Crawling session not found');
      }

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return crawlingSession;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw error;
    }
  }

  async crawl(params: CrawlDto): Promise<CrawlingSessionDocument> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'crawl',
      message: 'executing',
    };
    try {
      this.loggerService.info(loggerData);
      /* disable the previous active session */

      await this.crawlingSessionRepo.update(
        {
          websiteId: new mongoose.Types.ObjectId(params.websiteId),
          active: true,
        },
        {
          active: false,
        },
      );

      /* create a new crawling session */
      const createCrawlingSession = await this.crawlingSessionRepo.create({
        websiteId: params.websiteId,
        totalUrls: 0,
        urlsCrawled: 0,
        failureReason: null,
        active: true,
        status: CrawlingSessionStatus.IN_PROGRESS,
      });

      void this.determineCrawlingStrategy({
        crawlingSessionId: createCrawlingSession._id.toString(),
        ...params,
      });

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return createCrawlingSession;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw error;
    }
  }

  private async determineCrawlingStrategy(params: Crawling): Promise<void> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'determineCrawlingStrategy',
      message: 'executing',
    };
    try {
      this.loggerService.info(loggerData);

      const mainUrl = new URL(params.url);
      const sitemap = await Sitemap.fromUrl(mainUrl, this.loggerService);

      let data: { totalUrls: number };

      if (sitemap.checkSiteMaps()) {
        const extractedUrls: ExtractedUrl[] = sitemap
          .getSiteMaps()!
          .urlset.url.map((it) => {
            const urlWithOrigin = new URL(it.loc, mainUrl.origin);

            return {
              url: urlWithOrigin.href,
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

      await this.crawlingSessionRepo.update(
        { _id: new mongoose.Types.ObjectId(params.crawlingSessionId) },
        { totalUrls: data.totalUrls },
      );

      this.loggerService.info({ ...loggerData, message: 'executed' });
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw error;
    }
  }

  private async crawlWebsite(params: Crawling): Promise<{ totalUrls: number }> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'crawlWebsite',
      message: 'executing',
    };
    try {
      this.loggerService.info(loggerData);

      const cheerioClient = Cheerio.fromUrl(this.loggerService, params.url, {
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

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return {
        totalUrls: processedUrls.length,
      };
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw error;
    }
  }

  private async processExtractedUrl(
    extractedUrls: ExtractedUrl[],
    params: Crawling,
  ) {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'processExtractedUrl',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const bulkCreateCrawledUrl: CrawledUrl[] = extractedUrls.map(
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

      const bulkCreatedCrawleddUrl =
        await this.crawledUrlRepo.bulkCreate(bulkCreateCrawledUrl);

      const { CrawlContentQueue } = this.configurationService.getQueueNames();

      const tracingId = this.alSService.getTraceId() || ulid();

      const queueMessage: CrawlContentQueueMessage[] =
        bulkCreatedCrawleddUrl.map((it) => {
          const res: CrawlContentQueueMessage = {
            body: {
              crawlingSessionId: it.crawlingSessionId.toString(),
              crawlingUrlId: it._id.toString(),
              knowledgebaseId: params.knowledgebaseId,
              url: it.url,
              tracingId,
              bucketName: 'general',
            },
          };

          return res;
        });

      await this.awsSqsService.sendMessageInBatch(
        CrawlContentQueue,
        queueMessage,
      );

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return { totalUrls: bulkCreatedCrawleddUrl.length };
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw error;
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

  public async crawlContent(params: CrawlContentQueuePayload) {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'crawlContent',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const cheerioClient = Cheerio.fromUrl(this.loggerService, params.url);

      const extractedText: string = await cheerioClient.extractContent();

      const { crawler } = this.configurationService.getS3Buckets();

      const key = `${params.knowledgebaseId}/${params.crawlingSessionId}/${params.crawlingUrlId}.txt`;

      await this.awsS3Service.uploadTextToS3(crawler, key, extractedText);

      this.loggerService.debug({
        ...loggerData,
        message: `file uploaded to s3 path: ${key}`,
      });

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return {
        storageBucket: crawler,
        key,
      };
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('Something went wrong while crawlContent');
    }
  }

  /* Crawling Session CRUD Methods */
  async createCrawlingSession(
    data: CrawlingSession,
  ): Promise<CrawlingSessionDocument> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'createCrawlingSession',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);
      const session = await this.crawlingSessionRepo.create(data);
      this.loggerService.info({ ...loggerData, message: 'executed' });
      return session;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });
      throw error;
    }
  }

  async updateCrawlingSession(
    filter: FilterQuery<CrawlingSession>,
    update: Partial<CrawlingSession>,
  ): Promise<void> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'updateCrawlingSession',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);
      await this.crawlingSessionRepo.update(filter, update);
      this.loggerService.info({ ...loggerData, message: 'executed' });
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });
      throw error;
    }
  }

  async deleteCrawlingSession(
    filter: FilterQuery<CrawlingSession>,
  ): Promise<boolean> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'deleteCrawlingSession',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);
      await this.crawlingSessionRepo.delete(filter);
      this.loggerService.info({ ...loggerData, message: 'executed' });
      return true;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });
      throw error;
    }
  }

  async findCrawlingSessions(
    filter: FilterQuery<CrawlingSession>,
  ): Promise<CrawlingSessionDocument[]> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'findCrawlingSessions',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);
      const sessions = await this.crawlingSessionRepo.find(filter);
      this.loggerService.info({ ...loggerData, message: 'executed' });
      return sessions;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });
      throw error;
    }
  }

  /* Crawled URL CRUD Methods */
  async createCrawledUrl(data: CrawledUrl): Promise<CrawledUrl> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'createCrawledUrl',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);
      const url = await this.crawledUrlRepo.create(data);
      this.loggerService.info({ ...loggerData, message: 'executed' });
      return url;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });
      throw error;
    }
  }

  async updateCrawledUrl(
    filter: FilterQuery<CrawledUrl>,
    update: Partial<CrawledUrl>,
  ): Promise<void> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'updateCrawledUrl',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);
      await this.crawledUrlRepo.update(filter, update);
      this.loggerService.info({ ...loggerData, message: 'executed' });
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });
      throw error;
    }
  }

  async deleteCrawledUrl(filter: FilterQuery<CrawledUrl>): Promise<boolean> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'deleteCrawledUrl',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);
      await this.crawledUrlRepo.delete(filter);
      this.loggerService.info({ ...loggerData, message: 'executed' });
      return true;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });
      throw error;
    }
  }

  async findCrawledUrls(
    filter: FilterQuery<CrawledUrl>,
  ): Promise<CrawledUrl[]> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'findCrawledUrls',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);
      const urls = await this.crawledUrlRepo.find(filter);
      this.loggerService.info({ ...loggerData, message: 'executed' });
      return urls;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });
      throw error;
    }
  }

  async crawlUrlAggregation<T>(
    pipleine: any[],
    options?: AggregateOptions,
  ): Promise<T> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'crawlUrlAggregation',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const aggregation = await this.crawledUrlRepo.aggregation(
        pipleine,
        options,
      );

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return aggregation as T;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw error;
    }
  }

  async crawlingSessionBulkWrite(
    params: AnyBulkWriteOperation<CrawlingSession>[],
  ) {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlerService',
      function: 'crawlingSessionBulkWrite',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawlingSessionRepo.bulkWrite(params);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw error;
    }
  }
}
