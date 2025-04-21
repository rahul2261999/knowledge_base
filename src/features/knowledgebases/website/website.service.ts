import { Injectable } from '@nestjs/common';
import { WebsiteRepo } from './website.repo';
import { ILoggerData } from 'src/lib/logger/logger.type';
import { LoggingService } from 'src/lib/logger/logger.service';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { KnowledgebasesService } from '../knowledgebases.service';
import { Website } from './schema/website.schema';
import {
  CrawlingSessionStatus,
  FileExtensions,
  ProcessingStatus,
  Status,
  VectorDocumentSource,
} from 'src/core/constants/global.enum';
import mongoose from 'mongoose';
import NotFound from 'src/core/error/not-found';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import {
  CrawledUrlAggregationResult,
  SessionStatusStats,
} from './webiste.type';
import { ProcessWebpage } from 'src/features/events/events.type';
import FileProcessorBuilderFactory from 'src/lib/file_processors/file-processor-builder.factory';
import { VectorDocument } from 'src/lib/vector_store/pinecone/types/pinecone.type';
import { CrawlerService } from 'src/features/crawler/crawler.service';
import { PineconeVectorStoreService } from 'src/lib/vector_store/pinecone/pinecone-vector-store.service';
import mimetypes from 'mime-types';
import { flattenObject } from 'src/utils/helper';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DateTime } from 'luxon';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import { AwsS3Service } from 'src/lib/aws/aws_s3/aws-s3.service';

@Injectable()
export class WebsiteService {
  constructor(
    private readonly loggerService: LoggingService,
    private readonly websiteRepository: WebsiteRepo,
    private readonly knowledgeService: KnowledgebasesService,
    private readonly crawlService: CrawlerService,
    private readonly s3Service: AwsS3Service,
    private readonly pineconeVectorStoreService: PineconeVectorStoreService,
    private readonly configurationService: ConfigurationService,
  ) {}

  public async create(
    tenantId: string,
    knowledgebaseId: string,
    createWebsiteDto: CreateWebsiteDto,
  ) {
    const loggerData: ILoggerData = {
      serviceName: 'WebsiteService',
      function: 'create',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      await this.knowledgeService.findOne(knowledgebaseId);

      const createWebsite: Website = {
        tenantId,
        knowledgebaseId,
        url: createWebsiteDto.url,
        depth: createWebsiteDto.depth,
        processingStatus: ProcessingStatus.PROCESSING,
        status: Status.ACTIVE,
        createdBy: null,
        updatedBy: null,
      };

      const createdWebsite = await this.websiteRepository.create(createWebsite);

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });

      const parsedWebsite = createdWebsite.toJSON();

      await this.crawlService.crawl({
        websiteId: parsedWebsite._id.toString(),
        url: parsedWebsite.url,
        depth: parsedWebsite.depth,
        knowledgebaseId,
      });

      return createdWebsite.toJSON();
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async findAll(knowledgebaseId: string) {
    const loggerData: ILoggerData = {
      serviceName: 'WebsiteService',
      function: 'findAll',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const websites = await this.websiteRepository.find({
        knowledgebaseId,
      });

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });

      return websites.map((doc) => doc.toJSON());
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async findOne(id: string) {
    const loggerData: ILoggerData = {
      serviceName: 'WebsiteService',
      function: 'findOne',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const website = await this.websiteRepository.findOne({
        _id: new mongoose.Types.ObjectId(id),
      });

      if (!website) {
        throw new NotFound(`website not found with id: ${id}`);
      }

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });

      return website?.toJSON();
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async update(id: string, updatWebisteDto: UpdateWebsiteDto) {
    const loggerData: ILoggerData = {
      serviceName: 'WebsiteService',
      function: 'update',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const website = await this.findOne(id);

      const updateBody: Partial<Website> = {
        url: updatWebisteDto.url,
        depth: updatWebisteDto.depth,
      };

      const updatedDocument = await this.websiteRepository.update(
        { _id: website._id },
        updateBody,
      );

      /* 
        1. If url is different from exisiting delete existing indexes and restart the crawl
        2. If forceRefresh is true delete existing indexes restart the crawl
      */

      if (updatWebisteDto.url !== website.url || updatWebisteDto.forceRefresh) {
        const crawlingBukcet = this.configurationService.getAwsS3Buckets();

        await this.s3Service.deleteFolder(
          crawlingBukcet.crawler,
          `${website.knowledgebaseId}/`,
        );

        const indexNamespace = this.pineconeVectorStoreService.getNamespace(
          website.knowledgebaseId,
        );

        await indexNamespace.deleteDocuments({
          prefix: `${website._id.toString()}#`,
        });

        await this.crawlService.crawl({
          websiteId: website._id.toString(),
          url: updatWebisteDto.url,
          depth: website.depth,
          knowledgebaseId: website.knowledgebaseId,
        });
      }

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });

      return updatedDocument;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async remove(id: string) {
    const loggerData: ILoggerData = {
      serviceName: 'WebsiteService',
      function: 'remove',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const website = await this.findOne(id);

      const updatedDocument = await this.websiteRepository.delete({
        _id: website._id,
      });

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });

      return updatedDocument;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async processWebsitePages(params: ProcessWebpage) {
    const loggerData: ILoggerData = {
      serviceName: 'WebsiteService',
      function: 'processWebsitePages',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const checkCrawlSession = await this.crawlService.getCrawlingSession({
        _id: new mongoose.Types.ObjectId(params.crawlingSessionId),
      });

      const parsedSession = checkCrawlSession.toJSON();

      if (!parsedSession.active) {
        throw new NotFound('Crawling session not found or inactive');
      }

      const fileExist = await this.s3Service.download.checkFileExists(
        params.storageBucketName,
        params.storagePath,
      );

      if (!fileExist) {
        this.loggerService.error({
          ...loggerData,
          message: 'File does not exist',
          additionalArgs: {
            bucketName: params.bucketName,
            storagePath: params.storagePath,
          },
        });

        return;
      }

      const fileExtension = '.txt';

      const s3Document = await this.s3Service.download.downloadSmallFile(
        params.storageBucketName,
        params.storagePath,
      );

      const mimetype = mimetypes.lookup(fileExtension);

      const filePathOrBlob: string | Blob = new Blob(
        [s3Document.buffer.buffer],
        { type: mimetype || 'text/plain' },
      );

      const fileProcessorBuilder = FileProcessorBuilderFactory.getFileBuilder(
        FileExtensions.txt,
        this.loggerService,
      );

      const fileProcessor = fileProcessorBuilder
        .setFilepathOrBlob(filePathOrBlob)
        .build();

      const proccessedDocuments = await fileProcessor.process();

      const documentToEmbedd = proccessedDocuments.map(
        (proccessedDocument, index) => {
          const lines = flattenObject({
            lines: proccessedDocument.metadata.loc,
          });

          const data: VectorDocument = {
            id: `${checkCrawlSession.websiteId}#url_${params.crawlUrlId}#chunk_${index + 1}`,
            text: proccessedDocument.pageContent,
            metadata: {
              knowledgebaseId: params.knowledgebaseId,
              documentId: params.crawlUrlId,
              crawlSessionId: params.crawlingSessionId,
              source: VectorDocumentSource.WEBSITE,
              url: params.url,
              bucketName: params.bucketName.toLowerCase(),
              ...lines,
            },
          };

          return data;
        },
      );

      const customerNamespace = this.pineconeVectorStoreService.getNamespace(
        params.knowledgebaseId,
      );

      await customerNamespace.addDocuments(documentToEmbedd);

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw error;
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'crawl_progress_monitor',
    waitForCompletion: true,
  })
  public async crawlProgressMonitor() {
    const loggerData: ILoggerData = {
      serviceName: 'WebsiteService',
      function: 'crawlProgressMonitor',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const crawlSessions = await this.crawlService.findCrawlingSessions({
        status: CrawlingSessionStatus.IN_PROGRESS,
        createdAt: { $gt: DateTime.now().minus({ days: 7 }).toUTC() },
      });

      if (!crawlSessions.length) {
        this.loggerService.info({
          ...loggerData,
          message: 'No crawl sessions found',
        });

        return;
      }

      const sessionIds: mongoose.Types.ObjectId[] = [];
      const sessionIdAndWebisteIdMap = new Map<string, string>();

      crawlSessions.forEach((session) => {
        sessionIds.push(session._id);
        sessionIdAndWebisteIdMap.set(
          session._id.toString(),
          session.websiteId.toString(),
        );
      });

      const crawledUrlStats = await this.crawlService.crawlUrlAggregation<
        CrawledUrlAggregationResult[]
      >([
        {
          $match: {
            crawlingSessionId: { $in: sessionIds },
          },
        },
        {
          $group: {
            _id: {
              sessionId: '$crawlingSessionId',
              status: '$status',
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.sessionId',
            totalRecords: { $sum: '$count' },
            statusCounts: {
              $push: {
                status: '$_id.status',
                count: '$count',
              },
            },
          },
        },
      ]);

      const websiteCrawlingCompleted: mongoose.Types.ObjectId[] = [];

      const sessionStats: SessionStatusStats[] = crawledUrlStats.map(
        (stat) => ({
          sessionId: stat._id.toString(),
          totalRecords: stat.totalRecords,
          statusCounts: stat.statusCounts.reduce(
            (acc, curr) => {
              acc[curr.status] = curr.count;
              return acc;
            },
            {} as SessionStatusStats['statusCounts'],
          ),
        }),
      );

      const bulkUpdateOperations = sessionStats.map((sessionStat) => {
        let totalCrawledUrls = 0;

        if (sessionStat.statusCounts.SUCCESS) {
          totalCrawledUrls += sessionStat.statusCounts.SUCCESS;
        }

        let sessionStatus: CrawlingSessionStatus;

        if (
          sessionStat.statusCounts.PENDING &&
          sessionStat.statusCounts.PENDING > 0
        ) {
          sessionStatus = CrawlingSessionStatus.IN_PROGRESS;
        } else {
          sessionStatus = CrawlingSessionStatus.COMPLETED;

          if (sessionIdAndWebisteIdMap.has(sessionStat.sessionId)) {
            const websiteId = sessionIdAndWebisteIdMap.get(
              sessionStat.sessionId,
            )!;
            websiteCrawlingCompleted.push(
              new mongoose.Types.ObjectId(websiteId),
            );
          }
        }

        return {
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(sessionStat.sessionId) },
            update: {
              $set: {
                urlsCrawled: totalCrawledUrls,
                status: sessionStatus,
              },
            },
          },
        };
      });

      const bulkWriteResult =
        this.crawlService.crawlingSessionBulkWrite(bulkUpdateOperations);
      const bulkUpdateWebsite = this.websiteRepository.update(
        {
          _id: { $in: websiteCrawlingCompleted },
        },
        {
          processingStatus: ProcessingStatus.COMPLETED,
        },
      );

      const resolvedPromises = await Promise.all([
        bulkWriteResult,
        bulkUpdateWebsite,
      ]);

      const [bulkWriteResponse, updateWebsiteResult] = resolvedPromises;

      this.loggerService.notice({
        ...loggerData,
        message: 'Bulk write response',
        additionalArgs: { bulkWriteResponse },
      });
      this.loggerService.notice({
        ...loggerData,
        message: 'Update website response',
        additionalArgs: { updateWebsiteResult },
      });

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw error;
    }
  }
}
