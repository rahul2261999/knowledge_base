import { Document } from "@langchain/core/documents";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import AbstractFileProcessor from "../index.processor";
import { IBaseFileProcessor } from "../index.type";

class DocxProcessor extends AbstractFileProcessor {
  private docxLoader: DocxLoader;

  constructor(filePathOrBlob: string | Blob ) {
    super();
    this.docxLoader = new DocxLoader(filePathOrBlob);
  }

  public async load(): Promise<IBaseFileProcessor> {
    try {
      const data = await this.docxLoader.load();
      this.setOriginalDocuments(data);
      this.setParsedDocuemnts(data);

      return this;
    } catch (error) {

      throw error;
    }
  }
}

export default DocxProcessor;