import { IBaseFileProcessor, IPdfProcessorBuilderMethods } from "../index.type";
import PdfProcessor from "./pdf.processor";
import { IPdfLoaderParams } from "./pdf.type";

class PdfProcessorBuilder implements IPdfProcessorBuilderMethods {
  private params: Partial<IPdfLoaderParams> = {};

  constructor() { }

  public setFilepathOrBlob(filepathOrBlob: string | Blob): this {
    this.params = { ...this.params, filepathOrBlob };

    return this;
  }

  public setLoaderOptions(pdfLoaderOptions: IPdfLoaderParams["pdfLoaderOptions"]): this {
    this.params = { ...this.params, pdfLoaderOptions };

    return this;
  }

  // Build and return the PdfProcessor
  public build(): IBaseFileProcessor {
    if (!this.params.filepathOrBlob) {
      throw new Error("PdfProcessorBuilder: Missing 'filepathOrBlob' parameter.");
    }

    return new PdfProcessor(this.params as IPdfLoaderParams);
  }
}

export default PdfProcessorBuilder;
