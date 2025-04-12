import { FileExtensions } from "../constants/global.enum";
import DocProcessorBuilder from "./doc/doc_processsor.builder";
import { BaseFileBuilderMethods } from "./index.type";
import PdfProcessorBuilder from "./pdf/pdf_processor.builder";

class FileProcessorBuilderFactory {

  private constructor() { }

  public static getFileBuilder<K extends keyof BaseFileBuilderMethods>(extension: K): BaseFileBuilderMethods[K] {
    switch (extension) {
      case FileExtensions.pdf:
        return new PdfProcessorBuilder() as BaseFileBuilderMethods[K];
      case FileExtensions.doc:
      case FileExtensions.docx:
        return new DocProcessorBuilder() as unknown as BaseFileBuilderMethods[K];
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }
}

export default FileProcessorBuilderFactory;