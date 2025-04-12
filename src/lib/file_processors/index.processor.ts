import { Document } from '@langchain/core/documents';
import { BaseFileProcessor, IStoreOpions } from './index.type';
import { ILoggerData } from '../logger/logger.type';
import { IBaseTextSplitter } from '../text_splitters/index.type';
import RecursiveTextSplitter from '../text_splitters/recursive-text.splitter';
import { LoggingService } from '../logger/logger.service';
import { PineconeVectorStoreService } from '../vector_store/pinecone/pinecone-vector-store.service';
import InternalServer from 'src/core/error/internal-server.error';

abstract class AbstractFileProcessor implements BaseFileProcessor {
  protected originalDocuments: Document[] = [];
  protected filteredDocuments: Document[] = [];

  constructor(
    protected readonly loggerService: LoggingService,
    protected readonly textSplitter: IBaseTextSplitter = new RecursiveTextSplitter(
      {
        chunkSize: 1000,
        chunkOverlap: 200,
      },
    ),
  ) {}

  /** Load documents from a file */
  protected abstract load(): Promise<Document[]>;

  /** Allow users to filter documents before splitting */
  public filterDocuments(filterFn: (doc: Document) => boolean): void {
    this.filteredDocuments = this.originalDocuments.filter(filterFn);
  }

  /** Split documents into smaller chunks */
  protected async split(): Promise<Document[]> {
    const loggerData: ILoggerData = {
      serviceName: 'AbstractFileProcessor',
      function: 'split',
      message: 'Executing document splitting...',
    };

    try {
      this.loggerService.info(loggerData);

      const docsToSplit =
        this.filteredDocuments.length > 0
          ? this.filteredDocuments
          : this.originalDocuments;

      if (!docsToSplit.length) {
        throw new Error('No documents available for splitting.');
      }

      const splitDocuments =
        await this.textSplitter.splitDocuments(docsToSplit);

      loggerData.message = 'Document splitting completed successfully';
      this.loggerService.info(loggerData);

      return splitDocuments;
    } catch (error) {
      loggerData.message = `Splitting failed: ${error.message}`;
      this.loggerService.error(loggerData);

      throw new InternalServer(
        'Something went wrong while splitting the document',
      );
    }
  }

  /** Process the file: load, allow filtering, then split */
  public async process(): Promise<Document[]> {
    const loggerData: ILoggerData = {
      serviceName: 'AbstractFileProcessor',
      function: 'process',
      message: 'Processing started...',
    };

    try {
      this.loggerService.info(loggerData);

      this.originalDocuments = await this.load();

      const processedDocs = await this.split();

      loggerData.message = 'Processing completed successfully';
      this.loggerService.info(loggerData);

      return processedDocs;
    } catch (error) {
      loggerData.message = `Processing failed: ${error.message}`;
      this.loggerService.error(loggerData);

      throw error;
    }
  }
}

export default AbstractFileProcessor;
