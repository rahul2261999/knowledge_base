import { Injectable } from '@nestjs/common';
import { CreateKnowledgebaseDto } from './dto/create-knowledgebase.dto';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';
import { KnowledgebaseRepo } from './knowledgebase.repo';
import NotFound from 'src/core/error/not-found';
import { QueryDto } from './dto/query.dto';
import { PineconeVectorStoreService } from 'src/lib/vector_store/pinecone/pinecone-vector-store.service';
import { FetchedVectorDocument } from 'src/lib/vector_store/pinecone/types/pinecone.type';
import BadRequest from 'src/core/error/bad-request';
import { DeleteResult } from 'mongoose';
import { Status } from 'src/core/constants/global.enum';
import { BaseParamsDto } from './dto/base-params.dto';
import { Knowledgebase } from './schema/knowledgebase.schema';

@Injectable()
export class KnowledgebasesService {
  constructor(
    private readonly loggerService: LoggingService,
    private readonly knowledgebaseRepo: KnowledgebaseRepo,
    private readonly pineconeVectorService: PineconeVectorStoreService,
  ) {}

  public async create(
    tenantId: string,
    createKnowledgebaseDto: CreateKnowledgebaseDto,
  ) {
    const loggerData: ILoggerData = {
      serviceName: 'KnowledgebasesService',
      function: 'create',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const createdknowledgebase = await this.knowledgebaseRepo.create({
        ...createKnowledgebaseDto,
        tenantId,
        status: Status.ACTIVE,
        createdBy: '1',
        updatedBy: '1',
      });

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return createdknowledgebase.toJSON();
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async findAll(knowledgebase: Partial<Knowledgebase>) {
    const loggerData: ILoggerData = {
      serviceName: 'KnowledgebasesService',
      function: 'findAll',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const knowledgebases = await this.knowledgebaseRepo.find(knowledgebase);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return knowledgebases.map((knowledgebase) => knowledgebase.toJSON());
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async findOne(knowledgebaseId: string) {
    const loggerData: ILoggerData = {
      serviceName: 'KnowledgebasesService',
      function: 'findOne',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const knowledgebases = await this.knowledgebaseRepo.findOne({
        knowledgebaseId,
      });

      if (!knowledgebases) {
        throw new NotFound('Knowledgebase not found');
      }

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return knowledgebases.toJSON();
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async remove(knowledgebaseId: string): Promise<DeleteResult> {
    const loggerData: ILoggerData = {
      serviceName: 'KnowledgebasesService',
      function: 'remove',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const knowledgebase = await this.findOne(knowledgebaseId);

      const knowledgebases = await this.knowledgebaseRepo.delete({
        _id: knowledgebase._id,
      });

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return knowledgebases;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async query(knowledgebaseId: string, query: QueryDto) {
    const loggerData: ILoggerData = {
      serviceName: 'KnowledgebasesService',
      function: 'query',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      await this.findOne(knowledgebaseId);

      const namespace =
        await this.pineconeVectorService.getNamespace(knowledgebaseId);

      let filter: object | undefined;

      if (query.bucketName !== 'all') {
        filter = { bucketName: query.bucketName };
      }

      const vectorDocuments = await namespace.query<FetchedVectorDocument[]>(
        query.query,
        filter,
      );

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return vectorDocuments;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }
}
