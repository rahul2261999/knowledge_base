import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LoggingService } from 'src/lib/logger/logger.service';
import { Website, WebsiteDocument } from './schema/website.schema';
import {
  DeleteResult,
  Model,
  RootFilterQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import { ILoggerData } from 'src/lib/logger/logger.type';
import InternalServer from 'src/core/error/internal-server.error';

@Injectable()
export class WebsiteRepo {
  constructor(
    private readonly loggerService: LoggingService,
    @InjectModel(Website.name) private readonly websiteModel: Model<Website>,
  ) {}

  public async create(website: Website): Promise<WebsiteDocument> {
    const logData: ILoggerData = {
      serviceName: 'WebsiteRepo',
      function: 'create',
      message: 'Creating website document',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.websiteModel.create(website);

      this.loggerService.info({
        ...logData,
        message: 'website document created',
      });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to create website document' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to create website document');
    }
  }

  public async update(
    findOptions: RootFilterQuery<Website>,
    website: Partial<Website>,
  ): Promise<UpdateWriteOpResult> {
    const logData: ILoggerData = {
      serviceName: 'WebsiteRepo',
      function: 'update',
      message: 'Updating website document',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.websiteModel.updateOne(findOptions, website);

      this.loggerService.info({
        ...logData,
        message: 'website document updated',
      });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to update website document' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to update website document');
    }
  }

  public async findOne(
    findOptions: RootFilterQuery<Website>,
  ): Promise<WebsiteDocument | null> {
    const logData: ILoggerData = {
      serviceName: 'WebsiteRepo',
      function: 'findOne',
      message: 'Finding website document',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.websiteModel.findOne(findOptions);

      this.loggerService.info({
        ...logData,
        message: 'website document found',
      });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to find website document' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to find website document');
    }
  }

  public async find(
    findOptions: RootFilterQuery<Website>,
  ): Promise<WebsiteDocument[]> {
    const logData: ILoggerData = {
      serviceName: 'WebsiteRepo',
      function: 'find',
      message: 'Finding website documents',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.websiteModel.find(findOptions);

      this.loggerService.info({
        ...logData,
        message: 'website documents found',
      });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to find website documents' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to find website documents');
    }
  }

  public async delete(
    findOptions: RootFilterQuery<Website>,
  ): Promise<DeleteResult> {
    const logData: ILoggerData = {
      serviceName: 'WebsiteRepo',
      function: 'delete',
      message: 'Deleting website document',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.websiteModel.deleteOne(findOptions);

      this.loggerService.info({
        ...logData,
        message: 'document website deleted',
      });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to delete website document' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to delete website document');
    }
  }
}
