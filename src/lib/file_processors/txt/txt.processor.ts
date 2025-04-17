import { ILoggerData } from 'src/lib/logger/logger.type';
import AbstractFileProcessor from '../index.processor';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { LoggingService } from 'src/lib/logger/logger.service';
import InternalServer from 'src/core/error/internal-server.error';
import { Document } from '@langchain/core/documents';
import { ITextLoaderParams } from './txt.type';

class TextProcessor extends AbstractFileProcessor {
  private textLoader: TextLoader;

  constructor(params: ITextLoaderParams, loggerService: LoggingService) {
    super(loggerService);

    this.textLoader = new TextLoader(params.filepathOrBlob);
  }

  protected async load(): Promise<Document[]> {
    const loggerData: ILoggerData = {
      serviceName: 'TextProcessor',
      function: 'load',
      message: 'Loading txt file...',
    };
    try {
      this.loggerService.info(loggerData);

      const documents = await this.textLoader.load();
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

export default TextProcessor;
