import * as EventEmitter from 'events'
import loggerService from '../utils/logger/logger.service';
import { EFileProcessorEvents, IBaseFileProcessor, IProcessIncomingFileAttrs } from '../file_processors/index.type';
import FileProcessorBuilderFactory from '../file_processors/file_processor_builder.factory';
import { FileExtensions } from '../constants/global.enum';
import documentRepo from '../dbs/mongodb/models/document/document.repo';
import path = require('path');
import { IngestionStatus } from '../dbs/mongodb/models/document/document.type';
import { asyncContextStore } from '../utils/helper/async_context_store.util';
import { ILoggerData } from '../utils/logger/logger.type';
import mongoose from 'mongoose';
import * as fs from 'fs';
class FileProcessorEvents {
  private static instance: FileProcessorEvents;
  private eventEmitter: EventEmitter;

  private constructor() {
    this.eventEmitter = new EventEmitter();
  }

  public static getInstance(): FileProcessorEvents {
    if (!FileProcessorEvents.instance) {
      FileProcessorEvents.instance = new FileProcessorEvents();
    }

    return FileProcessorEvents.instance;
  }

  public intilizeEventListeners() {
    loggerService.info('Intilizing FileProcessorEvents ......');

    this.eventEmitter.on(EFileProcessorEvents.PROCESS_INCOMING_FILE, (params: IProcessIncomingFileAttrs) => {
      asyncContextStore.runContext({}, async () => {
        asyncContextStore.setTraceId(params.tracingId);

        const loggerData: ILoggerData = {
          serviceName: 'FileProcessorEvents',
          function: 'Event: PROCESS_INCOMING_FILE',
        }

        try {
          loggerService.info(loggerData);

          const s3Document = await documentRepo.findOne({
            _id: new mongoose.Types.ObjectId(params.documentId),
            tenantId: params.tenantId,
          });

          if (!s3Document) {
            loggerData.message = "Document not found"
            loggerService.error(loggerData);

            return;
          }

          const parsedDocument = s3Document.toJSON();
          const fileExtension = path.extname(parsedDocument.nameWithExtension);

          let fileProcessor: IBaseFileProcessor;

          if (fileExtension === FileExtensions.pdf) {
            loggerData.message = "init pdf builder"
            loggerService.debug(loggerData);

            const fileProcessorBuilder = FileProcessorBuilderFactory.getFileBuilder(FileExtensions.pdf);

            fileProcessor = fileProcessorBuilder
              .setFilepathOrBlob(params.filePath)
              .build()
          } else if (fileExtension === FileExtensions.doc || fileExtension === FileExtensions.docx) {
            loggerData.message = "init document builder"
            loggerService.debug(loggerData);

            const fileProcessorBuilder = FileProcessorBuilderFactory.getFileBuilder(fileExtension);

            fileProcessor = fileProcessorBuilder
              .setFilepathOrBlob(params.filePath)
              .build()
          } else {
            loggerData.message = `Unsupported file format: ${fileExtension}`
            loggerService.error(loggerData);

            return;
          }

          s3Document.status = IngestionStatus.PROCESSING
          await s3Document.save();

          await fileProcessor.load()
          await fileProcessor.split();
          await fileProcessor.store({
            fileMetaData: {
              tenantId: params.tenantId,
              documentId: parsedDocument._id.toString(),
            }
          });

          s3Document.status = IngestionStatus.COMPLETED
          await s3Document.save();

          loggerData.message = "execution completed"
          loggerService.info(loggerData);
        } catch (error: any) {
          loggerService.error(error.message)
        } finally {
          if (params.filePath) {
            fs.unlink(params.filePath, (err) => {
              if (err) {
                loggerData.message = "file not found";
                loggerService.warn(loggerData, { error: err as Error })
              } else {
                loggerData.message = "file deleted successfully";
                loggerService.debug(loggerData)
              }
            });
          }
        }
      })
    })
  }

  public emitEvent(eventName: EFileProcessorEvents, params: IProcessIncomingFileAttrs) {
    this.eventEmitter.emit(eventName, params)
  }
}

const fileProcessorEvents = FileProcessorEvents.getInstance()

export { fileProcessorEvents };