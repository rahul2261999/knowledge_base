import { Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { LoggingService } from 'src/lib/logger/logger.service';
import { DocumentRepo } from './document.repo';
import { ILoggerData } from 'src/lib/logger/logger.type';
import { KnowledgebasesService } from '../knowledgebases.service';
import { Document } from './schema/document.schema';
import { AwsS3Service } from 'src/lib/aws_s3/aws-s3.service';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import { ProcessingStatus } from 'src/core/constants/global.enum';
import mongoose, { FilterQuery } from 'mongoose';
import fs from 'fs';
import NotFound from 'src/core/error/not-found';
import { DeleteDocumentDto } from './dto/delete-document.dto';
import { PineconeVectorStoreService } from 'src/lib/vector_store/pinecone/pinecone-vector-store.service';

@Injectable()
export class DocumentService {
  constructor(
    private readonly loggerService: LoggingService,
    private readonly documentRepo: DocumentRepo,
    private readonly knowledgeService: KnowledgebasesService,
    private readonly awsS3Service: AwsS3Service,
    private readonly configurationService: ConfigurationService,
    private readonly pineconeVectorService: PineconeVectorStoreService,
  ) {}

  public async create(
    file: Express.Multer.File,
    tenantId: string,
    knowledgebaseId: string,
    createDocumentDto: CreateDocumentDto,
  ) {
    const loggerData: ILoggerData = {
      serviceName: 'DocumentService',
      function: 'create',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      await this.knowledgeService.findOne(knowledgebaseId);

      const key = `${knowledgebaseId}/document/${file.filename}`;

      await this.awsS3Service.uploadFile(
        this.configurationService.getS3Buckets().knowledgebase,
        key,
        file,
      );

      const createDocumeent: Document = {
        tenantId,
        knowledgebaseId,
        name: file.originalname,
        tag: createDocumentDto.tag,
        size: file.size,
        processingStatus: ProcessingStatus.UPLOADED,
        url: key,
      };

      const createdDocument = await this.documentRepo.create(createDocumeent);

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });

      return createdDocument.toJSON();
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    } finally {
      if (fs.existsSync(file.path)) {
        fs.unlink(file.path, (err) => {
          if (err) {
            this.loggerService.error(
              {
                ...loggerData,
                message: `unable to delete the file: ${file.filename}`,
              },
              { error: err },
            );
          }
          this.loggerService.info({
            ...loggerData,
            message: 'file deleted after processing',
          });
        });
      }
    }
  }

  public async findAll(knowledgebaseId: string) {
    const loggerData: ILoggerData = {
      serviceName: 'DocumentService',
      function: 'findAll',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const documents = await this.documentRepo.find({
        knowledgebaseId,
      });

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });

      return documents.map((doc) => doc.toJSON());
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async findOne(id: string) {
    const loggerData: ILoggerData = {
      serviceName: 'DocumentService',
      function: 'findOne',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const document = await this.documentRepo.findOne({
        _id: new mongoose.Types.ObjectId(id),
      });

      if (!document) {
        throw new NotFound(`Document not found with id: ${id}`);
      }

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });

      return document?.toJSON();
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    const loggerData: ILoggerData = {
      serviceName: 'DocumentService',
      function: 'update',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const document = await this.findOne(id);

      const updatedDocument = await this.documentRepo.update(
        document._id,
        updateDocumentDto,
      );

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

  public async internalUpdate(
    filter: FilterQuery<Document>,
    values: Partial<Document>,
  ) {
    const loggerData: ILoggerData = {
      serviceName: 'DocumentService',
      function: 'internalUpdate',
      message: 'executing',
    };

    try {
      const document = await this.documentRepo.findOne(filter);

      if (!document) {
        throw new NotFound(`Document not found`);
      }

      await this.documentRepo.update({ _id: document._id }, values);

      return {
        ...document.toJSON(),
        ...values,
      };
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async remove(params: DeleteDocumentDto) {
    const loggerData: ILoggerData = {
      serviceName: 'DocumentService',
      function: 'remove',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const document = await this.findOne(params.documentId);

      await this.documentRepo.delete(document._id);
      await this.awsS3Service.deleteFile(
        this.configurationService.getS3Buckets().knowledgebase,
        document.url,
      );

      const pineconeNamespace = this.pineconeVectorService.getNamespace(
        document.knowledgebaseId,
      );

      await pineconeNamespace.deleteDocuments({
        prefix: `${document._id.toString()}#`,
      });

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });

      return document;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }
}
