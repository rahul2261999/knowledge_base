import path = require('path');
import EventEmitter = require('events');
import { LoggingService } from 'src/lib/logger/logger.service';
import {
  FileExtensions,
  ProcessingStatus,
  VectorDocumentSource,
} from 'src/core/constants/global.enum';
import FileProcessorBuilderFactory from 'src/lib/file_processors/file-processor-builder.factory';
import { ILoggerData } from 'src/lib/logger/logger.type';
import { Injectable } from '@nestjs/common';
import { PineconeVectorStoreService } from 'src/lib/vector_store/pinecone/pinecone-vector-store.service';
import { DocumentService } from 'src/features/knowledgebases/document/document.service';
import { AwsS3Service } from 'src/lib/aws_s3/aws-s3.service';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import mimetypes from 'mime-types';
import mongoose from 'mongoose';
import { CustomEventEmitter } from 'src/core/common/emitter';
import { Document as DocumentRecord } from 'src/features/knowledgebases/document/schema/document.schema';
import { AlsService } from 'src/core/common/als/als.service';
import { VectorDocument } from 'src/lib/vector_store/pinecone/types/pinecone.type';
import { flattenObject } from 'src/utils/helper';
import { IProcessIncomingFileAttrs, ProcessWebpage } from '../events.type';
import { EFileProcessorEvents } from '../events.enum';
import { BaseFileProcessor } from 'src/lib/file_processors/index.type';
import { WebsiteService } from 'src/features/knowledgebases/website/website.service';

@Injectable()
export class FileProcessorEvents {
  private eventEmitter: EventEmitter = CustomEventEmitter;

  constructor(
    private loggerService: LoggingService,
    private documentService: DocumentService,
    private awsS3Service: AwsS3Service,
    private configurationService: ConfigurationService,
    private pineconVectorStoreService: PineconeVectorStoreService,
    private alsService: AlsService,
    private readonly websiteService: WebsiteService,
  ) {
    this.intilizeEventListeners();
  }

  public intilizeEventListeners() {
    this.eventEmitter.on(
      EFileProcessorEvents.PROCESS_INCOMING_FILE,
      (params: IProcessIncomingFileAttrs) => {
        this.alsService.runContext(new Map(), async () => {
          this.alsService.setTraceId(params.tracingId);

          const loggerData: ILoggerData = {
            serviceName: 'FileProcessorEvents',
            function: 'Event: PROCESS_INCOMING_FILE',
          };

          let s3TempDownloadPath: string | undefined;

          let document:
            | (DocumentRecord & { _id: mongoose.Types.ObjectId })
            | undefined;

          try {
            this.loggerService.info(loggerData);

            document = await this.documentService.findOne(params.documentId);

            await this.documentService.internalUpdate(
              { _id: document._id },
              { processingStatus: ProcessingStatus.PROCESSING },
            );

            const bucketName =
              this.configurationService.getS3Buckets().knowledgebase;

            const fileExist = await this.awsS3Service.download.checkFileExists(
              bucketName,
              document.url,
            );

            if (!fileExist) {
              this.loggerService.error({
                ...loggerData,
                message: 'File does not exist',
                additionalArgs: {
                  documentId: params.documentId,
                  url: document.url,
                },
              });

              return;
            }

            const fileExtension = path.extname(document.name);

            const s3Document =
              await this.awsS3Service.download.downloadSmallFile(
                this.configurationService.getS3Buckets().knowledgebase,
                document.url,
              );

            const mimetype = mimetypes.lookup(fileExtension);

            const filePathOrBlob: string | Blob = new Blob(
              [s3Document.buffer.buffer],
              { type: mimetype || 'text/plain' },
            );

            let fileProcessor: BaseFileProcessor;

            if (fileExtension === FileExtensions.pdf) {
              this.loggerService.debug({
                ...loggerData,
                message: 'init pdf builder',
              });

              const fileProcessorBuilder =
                FileProcessorBuilderFactory.getFileBuilder(
                  FileExtensions.pdf,
                  this.loggerService,
                );

              fileProcessor = fileProcessorBuilder
                .setFilepathOrBlob(filePathOrBlob)
                .build();
            } else if (
              fileExtension === FileExtensions.doc ||
              fileExtension === FileExtensions.docx
            ) {
              this.loggerService.debug({
                ...loggerData,
                message: 'init document builder',
              });

              const fileProcessorBuilder =
                FileProcessorBuilderFactory.getFileBuilder(
                  fileExtension,
                  this.loggerService,
                );

              fileProcessor = fileProcessorBuilder
                .setFilepathOrBlob(filePathOrBlob)
                .build();
            } else {
              this.loggerService.error({
                ...loggerData,
                message: `Unsupported file format: ${fileExtension}`,
              });

              return;
            }

            const proccessedDocuments = await fileProcessor.process();

            const documentToEmbedd = proccessedDocuments.map(
              (proccessedDocument, index) => {
                const lines = flattenObject({
                  lines: proccessedDocument.metadata.loc,
                });

                const data: VectorDocument = {
                  id: `${params.documentId}#chunk_${index + 1}`,
                  text: proccessedDocument.pageContent,
                  metadata: {
                    knowledgebaseId: params.knowledgebaseId,
                    documentId: params.documentId,
                    source: VectorDocumentSource.DOCUMENT,
                    filename: document!.name,
                    bucketName: document!.tag.toLowerCase(),
                    ...lines,
                  },
                };

                return data;
              },
            );

            const customerNamespace =
              await this.pineconVectorStoreService.getNamespace(
                params.knowledgebaseId,
              );

            await customerNamespace.addDocuments(documentToEmbedd);

            await this.documentService.internalUpdate(
              { _id: document._id },
              { processingStatus: ProcessingStatus.COMPLETED },
            );

            this.loggerService.info({
              ...loggerData,
              message: 'execution completed',
            });
          } catch (error: any) {
            this.loggerService.error(
              { ...loggerData, message: 'failed' },
              { error },
            );

            if (document) {
              await this.documentService
                .internalUpdate(
                  { _id: document._id },
                  { processingStatus: ProcessingStatus.ERROR },
                )
                .catch(() => {
                  this.loggerService.error({
                    ...loggerData,
                    message: 'Failed to update document status',
                  });
                });
            }
          } finally {
            if (s3TempDownloadPath) {
              this.loggerService.info({
                ...loggerData,
                message: 'cleanupTempFile',
              });

              this.awsS3Service.download.cleanupTempFile(s3TempDownloadPath);
            }
          }
        });
      },
    );

    this.eventEmitter.on(
      EFileProcessorEvents.PROCESS_INCOMING_WEBPAGE,
      (params: ProcessWebpage) => {
        this.alsService.runContext(new Map(), async () => {
          this.alsService.setTraceId(params.tracingId);

          const loggerData: ILoggerData = {
            serviceName: 'FileProcessorEvents',
            function: 'Event: PROCESS_INCOMING_WEBPAGE',
          };

          try {
            this.loggerService.info(loggerData);
            this.loggerService.debug({
              ...loggerData,
              message: 'processing webpage',
              additionalArgs: {
                crawledUrlId: params.crawlUrlId,
                url: params.url,
              },
            });

            await this.websiteService.processWebsitePages(params);

            this.loggerService.info({
              ...loggerData,
              message: 'execution completed',
            });
          } catch (error) {
            this.loggerService.error(
              { ...loggerData, message: 'failed' },
              { error },
            );
          }
        });
      },
    );
  }
}
