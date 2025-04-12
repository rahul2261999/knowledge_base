import { FileExtensions } from '../../core/constants/global.enum';
import { LoggingService } from '../logger/logger.service';
import { PineconeVectorStoreService } from '../vector_store/pinecone/pinecone-vector-store.service';
import DocProcessorBuilder from './doc/doc-processsor.builder';
import { BaseFileBuilderMethods } from './index.type';
import PdfProcessorBuilder from './pdf/pdf-processor.builder';

class FileProcessorBuilderFactory {
  private constructor() {}

  public static getFileBuilder<K extends keyof BaseFileBuilderMethods>(
    extension: K,
    loggerService: LoggingService,
  ): BaseFileBuilderMethods[K] {
    switch (extension) {
      case FileExtensions.pdf:
        return new PdfProcessorBuilder(
          loggerService,
        ) as BaseFileBuilderMethods[K];
      case FileExtensions.doc:
      case FileExtensions.docx:
        return new DocProcessorBuilder(
          loggerService,
        ) as unknown as BaseFileBuilderMethods[K];
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }
}

export default FileProcessorBuilderFactory;
