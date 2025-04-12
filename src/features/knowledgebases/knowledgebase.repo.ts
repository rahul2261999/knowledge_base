import { InjectModel } from '@nestjs/mongoose';
import {
  Knowledgebase,
  KnowledgebaseDocument,
} from './schema/knowledgebase.schema';
import {
  DeleteResult,
  Model,
  RootFilterQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import { Injectable } from '@nestjs/common';
import { ILoggerData } from 'src/lib/logger/logger.type';
import { LoggingService } from 'src/lib/logger/logger.service';
import InternalServer from 'src/core/error/internal-server.error';

@Injectable()
export class KnowledgebaseRepo {
  constructor(
    private loggerService: LoggingService,
    @InjectModel(Knowledgebase.name)
    private readonly knowledgebaseModel: Model<Knowledgebase>,
  ) {}

  public async create(
    knowledgebase: Knowledgebase,
  ): Promise<KnowledgebaseDocument> {
    const logData: ILoggerData = {
      serviceName: 'KnowledgebaseRepo',
      function: 'create',
      message: 'Creating knowledgebase',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.knowledgebaseModel.create(knowledgebase);

      this.loggerService.info({ ...logData, message: 'knowledgebase created' });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to create knowledgebase' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to create knowledgebase');
    }
  }

  public async update(
    findOptions: RootFilterQuery<Knowledgebase>,
    knowledgebase: Partial<Knowledgebase>,
  ): Promise<UpdateWriteOpResult> {
    const logData: ILoggerData = {
      serviceName: 'KnowledgebaseRepo',
      function: 'update',
      message: 'Updating knowledgebase',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.knowledgebaseModel.updateOne(
        findOptions,
        knowledgebase,
      );

      this.loggerService.info({ ...logData, message: 'knowledgebase updated' });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to update knowledgebase' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to update knowledgebase');
    }
  }

  public async findOne(
    findOptions: RootFilterQuery<Knowledgebase>,
  ): Promise<KnowledgebaseDocument | null> {
    const logData: ILoggerData = {
      serviceName: 'KnowledgebaseRepo',
      function: 'findOne',
      message: 'Finding knowledgebase',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.knowledgebaseModel.findOne(findOptions);

      this.loggerService.info({ ...logData, message: 'knowledgebase found' });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to find knowledgebase' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to find knowledgebase');
    }
  }

  public async find(
    findOptions: RootFilterQuery<Knowledgebase>,
  ): Promise<KnowledgebaseDocument[]> {
    const logData: ILoggerData = {
      serviceName: 'KnowledgebaseRepo',
      function: 'find',
      message: 'Finding knowledgebases',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.knowledgebaseModel.find(findOptions);

      this.loggerService.info({ ...logData, message: 'knowledgebases found' });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to find knowledgebases' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to find knowledgebases');
    }
  }

  public async delete(
    findOptions: RootFilterQuery<Knowledgebase>,
  ): Promise<DeleteResult> {
    const logData: ILoggerData = {
      serviceName: 'KnowledgebaseRepo',
      function: 'delete',
      message: 'Deleting knowledgebase',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.knowledgebaseModel.deleteOne(findOptions);

      this.loggerService.info({ ...logData, message: 'knowledgebase deleted' });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to delete knowledgebase' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to delete knowledgebase');
    }
  }
}
