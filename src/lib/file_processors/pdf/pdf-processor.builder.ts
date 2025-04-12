import { LoggingService } from 'src/lib/logger/logger.service';
import { PineconeVectorStoreService } from 'src/lib/vector_store/pinecone/pinecone-vector-store.service';
import { BaseFileProcessor, IPdfProcessorBuilderMethods } from '../index.type';
import PdfProcessor from './pdf.processor';
import { IPdfLoaderParams } from './pdf.type';

class PdfProcessorBuilder implements IPdfProcessorBuilderMethods {
  private params: Partial<IPdfLoaderParams> = {};

  constructor(private loggerService: LoggingService) {}

  public setFilepathOrBlob(filepathOrBlob: string | Blob): this {
    this.params = { ...this.params, filepathOrBlob };

    return this;
  }

  public setLoaderOptions(
    pdfLoaderOptions: IPdfLoaderParams['pdfLoaderOptions'],
  ): this {
    this.params = { ...this.params, pdfLoaderOptions };

    return this;
  }

  // Build and return the PdfProcessor
  public build(): BaseFileProcessor {
    if (!this.params.filepathOrBlob) {
      throw new Error(
        "PdfProcessorBuilder: Missing 'filepathOrBlob' parameter.",
      );
    }

    return new PdfProcessor(
      this.params as IPdfLoaderParams,
      this.loggerService,
    );
  }
}

export default PdfProcessorBuilder;
