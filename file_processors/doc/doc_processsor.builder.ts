import { IBaseFileProcessor, IDocProcessorBuilderMethods } from "../index.type";
import DocxProcessor from "./doc.processor";

class DocProcessorBuilder implements IDocProcessorBuilderMethods {
  private filePathOrBlob: string | Blob | null;

  constructor() {
    this.filePathOrBlob = null;
  }

  public setFilepathOrBlob(filepathOrBlob: string | Blob): this {
    this.filePathOrBlob = filepathOrBlob;

    return this;
  }

  // Build and return the PdfProcessor
  build(): IBaseFileProcessor {
    if (!this.filePathOrBlob) {
      throw new Error("DocProcessorBuilder: Missing 'filepathOrBlob' parameter.");
    }

    return new DocxProcessor(this.filePathOrBlob);
  }
}

export default DocProcessorBuilder;