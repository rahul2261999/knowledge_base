import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AggregateOptions,
  AnyBulkWriteOperation,
  DeleteResult,
  Model,
  RootFilterQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import { CrawledUrl, CrawledUrlDocument } from '../schemas/crawled-url.model';
import InternalServer from 'src/core/error/internal-server.error';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';

@Injectable()
class CrawledUrlRepo {
  constructor(
    @InjectModel(CrawledUrl.name) private crawledUrlModel: Model<CrawledUrl>,
    private readonly loggerService: LoggingService,
  ) {}

  public async create(crawlUrl: CrawledUrl): Promise<CrawledUrlDocument> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawledUrlRepo',
      function: 'create',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawledUrlModel.create(crawlUrl);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('something went wrong');
    }
  }

  public async bulkCreate(
    crawlUrls: CrawledUrl[],
  ): Promise<CrawledUrlDocument[]> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawledUrlRepo',
      function: 'bulkCreate',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawledUrlModel.create(crawlUrls);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('something went wrong');
    }
  }

  public async update(
    filterOption: RootFilterQuery<CrawledUrl>,
    crawlUrl: Partial<CrawledUrl>,
  ): Promise<UpdateWriteOpResult> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawledUrlRepo',
      function: 'update',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawledUrlModel.updateMany(
        filterOption,
        crawlUrl,
      );

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('something went wrong');
    }
  }

  public async findOne(
    params: RootFilterQuery<CrawledUrl>,
  ): Promise<CrawledUrlDocument | null> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawledUrlRepo',
      function: 'findOne',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawledUrlModel.findOne(params);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('something went wrong');
    }
  }

  public async find(
    params: RootFilterQuery<CrawledUrl>,
  ): Promise<CrawledUrlDocument[]> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawledUrlRepo',
      function: 'find',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawledUrlModel.find(params);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('something went wrong');
    }
  }

  public async delete(
    params: RootFilterQuery<CrawledUrl>,
  ): Promise<DeleteResult> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawledUrlRepo',
      function: 'delete',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawledUrlModel.deleteMany(params);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('something went wrong');
    }
  }

  public async aggregation<T = any[]>(
    pipleine: any[],
    options?: AggregateOptions,
  ): Promise<T> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawledUrlRepo',
      function: 'aggregation',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawledUrlModel.aggregate(pipleine, options);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data as T;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer(
        'something went wrong with aggregation pipeline',
      );
    }
  }

  public async bulkWrite(params: AnyBulkWriteOperation<CrawledUrl>[]) {
    const loggerData: ILoggerData = {
      serviceName: 'CrawledUrlRepo',
      function: 'bulkWrite',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawledUrlModel.bulkWrite(params);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('something went wrong');
    }
  }
}

export { CrawledUrlRepo };
