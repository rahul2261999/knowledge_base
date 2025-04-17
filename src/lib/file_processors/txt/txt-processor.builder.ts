import { LoggingService } from 'src/lib/logger/logger.service';
import { BaseFileProcessor, ITxtProcessorBuilderMethods } from '../index.type';
import { ITextLoaderParams } from './txt.type';
import TextProcessor from './txt.processor';

class TxtProcessorBuilder implements ITxtProcessorBuilderMethods {
  private params: Partial<ITextLoaderParams> = {};

  constructor(private loggerService: LoggingService) {}

  public setFilepathOrBlob(filepathOrBlob: string | Blob): this {
    this.params = { ...this.params, filepathOrBlob };

    return this;
  }

  // Build and return the PdfProcessor
  public build(): BaseFileProcessor {
    if (!this.params.filepathOrBlob) {
      throw new Error(
        "PdfProcessorBuilder: Missing 'filepathOrBlob' parameter.",
      );
    }

    return new TextProcessor(
      this.params as ITextLoaderParams,
      this.loggerService,
    );
  }
}

export default TxtProcessorBuilder;
