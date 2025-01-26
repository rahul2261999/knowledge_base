import { FileExtensions } from "../../constants/global.enum";
import DocxProcessor from "../../file_processors/doc/doc.processor";
import { EFileProcessorEvents, IBaseFileProcessor } from "../../file_processors/index.type";
import PdfProcessor from "../../file_processors/pdf/pdf.processor";
import BadRequest from "../../utils/error/bad_request";
import InternalServer from "../../utils/error/internal_server.error";
import FileHelper from "../../utils/helper/file.util";
import loggerService from "../../utils/logger/logger.service";
import { ILoggerData } from "../../utils/logger/logger.type";
import { IBulkUploadTrainingData, IDeleteTraininData, IIngestionMethods, IIngestionMethodsOptions, IUploadTrainingData } from "./ingestion.type";
import IngestionValidationSchema from "./ingestion.validation";
import documentRepo from "../../dbs/mongodb/models/document/document.repo";
import document_embeddingsRepo from "../../dbs/mongodb/models/document_embeddings/document_embeddings.repo";
import { CreateS3Document, IngestionStatus, S3Document } from "../../dbs/mongodb/models/document/document.type";
import { fileProcessorEvents } from "../../events/file_processor.service";
import { asyncContextStore } from "../../utils/helper/async_context_store.util";
import { v4 } from "uuid";

class IngestionService implements IIngestionMethods {
  private static instance: IngestionService;

  private constructor() { }

  public static getInstance(): IngestionService {
    if (!IngestionService.instance) {
      IngestionService.instance = new IngestionService();
    }
    return IngestionService.instance;
  };

  public async uploadTrainingData(params: IUploadTrainingData) {
    const loggerData: ILoggerData = {
      serviceName: 'IngestionService',
      function: 'uploadTrainingData',
      message: 'executing'
    }

    try {
      loggerService.info(loggerData);

      const validation = IngestionValidationSchema.uploadTrainingData.safeParse(params);

      if (!validation.success) {
        loggerService.error({ ...loggerData, message: 'validation failed', additionalArgs: validation.error });

        throw new BadRequest(validation.error.toString(), { error: validation.error.issues })
      }

      const fileHelper = new FileHelper(params.file);
      const fileExtension = fileHelper.getFileExtension();
      const validFileExtension = fileHelper.validateFileExtension(Object.values(FileExtensions))

      if (!validFileExtension) {
        const message = `File with extension ${fileExtension} not supported`

        throw new BadRequest(message)
      }

      const s3Docuemnt: CreateS3Document = {
        url: params.file.path,
        nameWithExtension: params.file.originalname,
        size: params.file.size,
        version: 0,
        status: IngestionStatus.PENDING,
        tenantId: params.metaData.tenantId,
        createdBy: null,
        updatedBy: null,
      }

      const newDocument = await documentRepo.create(s3Docuemnt);

      let fileProcessor: IBaseFileProcessor;

      if (fileExtension === FileExtensions.pdf) {
        fileProcessor = new PdfProcessor({
          filepathOrBlob: params.file.path,
        })
      } else if ([FileExtensions.doc, FileExtensions.docx].includes(fileExtension as FileExtensions)) {
        fileProcessor = new DocxProcessor(params.file.path);
      } else {

        // later will add the text processor
        const message = `File with extension ${fileExtension} not supported`

        throw new BadRequest(message)
      }

      fileProcessorEvents.emitEvent(EFileProcessorEvents.PROCESS_INCOMING_FILE, {
        tracingId: asyncContextStore.getTraceId() || v4(),
        filePath: params.file.path,
        tenantId: params.metaData.tenantId,
        documentId: newDocument._id.toString(),
      })
      loggerData.message = "execution completed"
      loggerService.info(loggerData);

      return {
        documentId: newDocument._id.toString(),
      }

    } catch (error) {

      throw InternalServer.fromError(error)
    }
  }
  public async bulkUploadTrainingData(params: IBulkUploadTrainingData, options: IIngestionMethodsOptions): Promise<void> {
    const loggerData: ILoggerData = {
      ...options.loggerData,
      serviceName: 'IngestionService',
      function: 'uploadTrainingData',
      message: 'executing'
    }

    try {
      loggerService.info(loggerData);

      const validation = IngestionValidationSchema.bulkUploadTrainingData.safeParse(params);

      if (!validation.success) {
        loggerService.error({ ...loggerData, message: 'validation failed' });

        throw new BadRequest(validation.error.toString())
      }

      const bulkUploadPromise = params.files.map(async file => {
        return await this.uploadTrainingData({ file, metaData: params.metaData })
      })

      await Promise.allSettled(bulkUploadPromise);

      loggerData.message = "execution completed"
      loggerService.info(loggerData);

    } catch (error) {

      throw InternalServer.fromError(error)
    }
  }
  public async deleteTrainingData(params: IDeleteTraininData): Promise<void> {
    const loggerData: ILoggerData = {
      serviceName: 'IngestionService',
      function: 'deleteTrainingData',
      message: 'executing'
    }

    try {
      loggerService.info(loggerData);
      const validation = IngestionValidationSchema.deleteTraininData.safeParse(params);

      if (!validation.success) {
        throw new BadRequest(validation.error.message, { error: validation.error.issues })
      }

      const deletedDocument = await documentRepo.deleteOne(params.documentId);
      const deleteEmbeddings = await document_embeddingsRepo.deleteMany({
        tenantId: params.tenantId,
        documentId: params.documentId
      });

      loggerService.debug({ ...loggerData, message: '', additionalArgs: { deletedDocument, deleteEmbeddings } })

      loggerData.message = "execution completed"
      loggerService.info(loggerData);

    } catch (error) {

      throw InternalServer.fromError(error)
    }
  };

}

export default IngestionService.getInstance();