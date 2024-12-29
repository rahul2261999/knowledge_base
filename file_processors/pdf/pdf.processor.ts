import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { IBaseFileProcessor } from "../index.type";
import { IPdfLoaderParams } from "./pdf.type";
import { Document } from "@langchain/core/documents";
import { IBaseTextSplitter } from "../../text_splitters/index.type";
import AbstractFileProcessor from "../index.processor";

class PdfProcessor extends AbstractFileProcessor {
  private pdfLoader: PDFLoader;

  constructor(params: IPdfLoaderParams) {
    super();
    this.pdfLoader = new PDFLoader(params.filepathOrBlob, params.pdfLoaderOptions);
  }


  public async load(): Promise<Document[]> {
    try {
      const data = await this.pdfLoader.load();
      this.setLoadedDocuments(data);

      return data;
    } catch (error) {

      throw error;
    }
  }
}