import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AnyBulkWriteOperation,
  DeleteResult,
  Model,
  RootFilterQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import {
  CrawlingSession,
  CrawlingSessionDocument,
} from '../schemas/crawling-session.model';
import InternalServer from 'src/core/error/internal-server.error';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';

@Injectable()
class CrawlingSessionRepo {
  constructor(
    @InjectModel(CrawlingSession.name)
    private crawlingSessionModel: Model<CrawlingSession>,
    private readonly loggerService: LoggingService,
  ) {}

  public async create(
    crawlingSession: CrawlingSession,
  ): Promise<CrawlingSessionDocument> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlingSessionRepo',
      function: 'create',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawlingSessionModel.create(crawlingSession);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('something went wrong');
    }
  }

  public async update(
    filterOption: RootFilterQuery<CrawlingSession>,
    webiste: Partial<CrawlingSession>,
  ): Promise<UpdateWriteOpResult> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlingSessionRepo',
      function: 'update',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawlingSessionModel.updateMany(
        filterOption,
        webiste,
      );

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('something went wrong');
    }
  }

  public async findOne(
    params: RootFilterQuery<CrawlingSession>,
  ): Promise<CrawlingSessionDocument | null> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlingSessionRepo',
      function: 'findOne',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawlingSessionModel.findOne(params);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('something went wrong');
    }
  }

  public async find(
    params: RootFilterQuery<CrawlingSession>,
  ): Promise<CrawlingSessionDocument[]> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlingSessionRepo',
      function: 'find',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawlingSessionModel.find(params);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('something went wrong');
    }
  }

  public async delete(
    params: RootFilterQuery<CrawlingSession>,
  ): Promise<DeleteResult> {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlingSessionRepo',
      function: 'delete',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawlingSessionModel.deleteMany(params);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('something went wrong');
    }
  }

  public async bulkWrite(params: AnyBulkWriteOperation<CrawlingSession>[]) {
    const loggerData: ILoggerData = {
      serviceName: 'CrawlingSessionRepo',
      function: 'bulkWrite',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const data = await this.crawlingSessionModel.bulkWrite(params);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return data;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer('something went wrong');
    }
  }
}

export { CrawlingSessionRepo };
