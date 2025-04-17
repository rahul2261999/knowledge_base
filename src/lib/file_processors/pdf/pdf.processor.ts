import { Document } from '@langchain/core/documents';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { IPdfLoaderParams } from './pdf.type';
import AbstractFileProcessor from '../index.processor';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';
import InternalServer from 'src/core/error/internal-server.error';

class PdfProcessor extends AbstractFileProcessor {
  private pdfLoader: PDFLoader;

  constructor(params: IPdfLoaderParams, loggerService: LoggingService) {
    super(loggerService);

    this.pdfLoader = new PDFLoader(
      params.filepathOrBlob,
      params.pdfLoaderOptions,
    );
  }

  protected async load(): Promise<Document[]> {
    const loggerData: ILoggerData = {
      serviceName: 'PdfProcessor',
      function: 'load',
      message: 'Loading pdf file...',
    };
    try {
      this.loggerService.info(loggerData);

      const documents = await this.pdfLoader.load();
      this.originalDocuments = documents;

      this.loggerService.info({
        ...loggerData,
        message: 'pdf file loaded successfully.',
      });

      return documents;
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: `Failed to load pdf file: ${error.message}` },
        { error },
      );

      throw new InternalServer(
        'Something went wrong while proccessing the pdf',
      );
    }
  }
}

export default PdfProcessor;
