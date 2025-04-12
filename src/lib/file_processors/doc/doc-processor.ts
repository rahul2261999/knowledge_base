import { Document } from '@langchain/core/documents';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import AbstractFileProcessor from '../index.processor';
import { BaseFileProcessor } from '../index.type';
import { LoggingService } from 'src/lib/logger/logger.service';
import { PineconeVectorStoreService } from 'src/lib/vector_store/pinecone/pinecone-vector-store.service';
import InternalServer from 'src/core/error/internal-server.error';

class DocxProcessor extends AbstractFileProcessor {
  private readonly docxLoader: DocxLoader;

  constructor(filePathOrBlob: string | Blob, loggerService: LoggingService) {
    super(loggerService);
    this.docxLoader = new DocxLoader(filePathOrBlob);
  }

  /** Load `.docx` file content into Document objects */
  protected async load(): Promise<Document[]> {
    const loggerData = {
      serviceName: 'DocxProcessor',
      function: 'load',
      message: 'Loading DOCX file...',
    };

    try {
      this.loggerService.info(loggerData);

      const documents = await this.docxLoader.load();
      this.originalDocuments = documents;

      this.loggerService.info({
        ...loggerData,
        message: 'DOCX file loaded successfully.',
      });

      return documents;
    } catch (error) {
      loggerData.message = `Failed to load DOCX file: ${error.message}`;
      this.loggerService.error(
        {
          ...loggerData,
          message: 'Failed to load DOCX file: ${error.message}',
        },
        { error },
      );

      throw new InternalServer(
        'Something went wrong while proccessing the document',
      );
    }
  }
}

export default DocxProcessor;
