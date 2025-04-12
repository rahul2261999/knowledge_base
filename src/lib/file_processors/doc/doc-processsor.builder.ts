import { LoggingService } from 'src/lib/logger/logger.service';
import { BaseFileProcessor, IDocProcessorBuilderMethods } from '../index.type';
import DocxProcessor from './doc-processor';
import { PineconeVectorStoreService } from 'src/lib/vector_store/pinecone/pinecone-vector-store.service';

class DocProcessorBuilder implements IDocProcessorBuilderMethods {
  private filePathOrBlob: string | Blob | null;

  constructor(private loggerService: LoggingService) {
    this.filePathOrBlob = null;
  }

  public setFilepathOrBlob(filepathOrBlob: string | Blob): this {
    this.filePathOrBlob = filepathOrBlob;

    return this;
  }

  // Build and return the PdfProcessor
  build(): BaseFileProcessor {
    if (!this.filePathOrBlob) {
      throw new Error(
        "DocProcessorBuilder: Missing 'filepathOrBlob' parameter.",
      );
    }

    return new DocxProcessor(this.filePathOrBlob, this.loggerService);
  }
}

export default DocProcessorBuilder;
