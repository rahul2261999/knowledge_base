import { FileExtensions } from "../../constants/global.enum";
import DocxProcessor from "../../file_processors/doc/doc.processor";
import { IBaseFileProcessor } from "../../file_processors/index.type";
import PdfProcessor from "../../file_processors/pdf/pdf.processor";
import BadRequest from "../../utils/error/bad_request";
import InternalServer from "../../utils/error/internal_server.error";
import FileHelper from "../../utils/helper/file.util";
import loggerService from "../../utils/logger/logger.service";
import { ILoggerData } from "../../utils/logger/logger.type";
import { IBulkUploadTrainingData, IIngestionMethods, IIngestionMethodsOptions, IUploadTrainingData } from "./ingestion.type";
import ValidationSchema from "./ingestion.validation";

class IngestionService implements IIngestionMethods {
  private static instance: IngestionService;

  private constructor() { }

  public static getInstance(): IngestionService {
    if (!IngestionService.instance) {
      IngestionService.instance = new IngestionService();
    }
    return IngestionService.instance;
  };

  public async uploadTrainingData(params: IUploadTrainingData, options: IIngestionMethodsOptions): Promise<void> {
    const loggerData: ILoggerData = {
      ...options.loggerData,
      serviceName: 'IngestionService',
      function: 'uploadTrainingData',
      message: 'executing'
    }

    try {
      loggerService.info(loggerData);

      const validation = ValidationSchema.uploadTrainingData.safeParse(params);

      if (!validation.success) {
        loggerService.error({ ...loggerData, message: 'validation failed' });

        throw new BadRequest(validation.error.toString(), { correlationId: loggerData.correlationId })
      }

      const fileHelper = new FileHelper(params.file);
      const fileExtension = fileHelper.getFileExtension();
      const validFileExtension = fileHelper.validateFileExtension(Object.values(FileExtensions))

      if (!validFileExtension) {
        const message = `File with extension ${fileExtension} not supported`

        throw new BadRequest(message, { correlationId: loggerData.correlationId })
      }

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

        throw new BadRequest(message, { correlationId: loggerData.correlationId })
      }

      await fileProcessor.load();
      await fileProcessor.split();
      await fileProcessor.store();

      loggerData.message = "execution completed"
      loggerService.info(loggerData);

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
      

      loggerData.message = "execution completed"
      loggerService.info(loggerData);

    } catch (error) {

      throw InternalServer.fromError(error)
    }
  }
  public async deleteTrainingData(params: any, options: IIngestionMethodsOptions): Promise<void> {
    const loggerData: ILoggerData = {
      ...options.loggerData,
      serviceName: 'IngestionService',
      function: 'uploadTrainingData',
      message: 'executing'
    }

    try {
      loggerService.info(loggerData);

      loggerData.message = "execution completed"
      loggerService.info(loggerData);

    } catch (error) {

      throw InternalServer.fromError(error)
    }
  };

}

export default IngestionService.getInstance();