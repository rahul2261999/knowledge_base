import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LoggingService } from 'src/lib/logger/logger.service';
import { Document, DocumentDocument } from './schema/document.schema';
import {
  DeleteResult,
  Model,
  RootFilterQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import { ILoggerData } from 'src/lib/logger/logger.type';
import InternalServer from 'src/core/error/internal-server.error';

@Injectable()
export class DocumentRepo {
  constructor(
    private readonly loggerService: LoggingService,
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
  ) {}

  public async create(document: Document): Promise<DocumentDocument> {
    const logData: ILoggerData = {
      serviceName: 'DocumentRepo',
      function: 'create',
      message: 'Creating document',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.documentModel.create(document);

      this.loggerService.info({ ...logData, message: 'document created' });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to create document' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to create document');
    }
  }

  public async update(
    findOptions: RootFilterQuery<Document>,
    document: Partial<Document>,
  ): Promise<UpdateWriteOpResult> {
    const logData: ILoggerData = {
      serviceName: 'DocumentRepo',
      function: 'update',
      message: 'Updating document',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.documentModel.updateOne(findOptions, document);

      this.loggerService.info({ ...logData, message: 'document updated' });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to update document' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to update document');
    }
  }

  public async findOne(
    findOptions: RootFilterQuery<Document>,
  ): Promise<DocumentDocument | null> {
    const logData: ILoggerData = {
      serviceName: 'DocumentRepo',
      function: 'findOne',
      message: 'Finding document',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.documentModel.findOne(findOptions);

      this.loggerService.info({ ...logData, message: 'document found' });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to find document' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to find document');
    }
  }

  public async find(
    findOptions: RootFilterQuery<Document>,
  ): Promise<DocumentDocument[]> {
    const logData: ILoggerData = {
      serviceName: 'DocumentRepo',
      function: 'find',
      message: 'Finding knowledgebases',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.documentModel.find(findOptions);

      this.loggerService.info({ ...logData, message: 'documents found' });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to find documents' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to find knowledgebases');
    }
  }

  public async delete(
    findOptions: RootFilterQuery<Document>,
  ): Promise<DeleteResult> {
    const logData: ILoggerData = {
      serviceName: 'DocumentRepo',
      function: 'delete',
      message: 'Deleting document',
    };

    try {
      this.loggerService.info(logData);

      const data = await this.documentModel.deleteOne(findOptions);

      this.loggerService.info({ ...logData, message: 'document deleted' });

      return data;
    } catch (error) {
      this.loggerService.error(
        { ...logData, message: 'failed to delete document' },
        { error: error as Error },
      );

      throw new InternalServer('Failed to delete document');
    }
  }
}
