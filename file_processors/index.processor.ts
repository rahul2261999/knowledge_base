import { Document } from "@langchain/core/documents";
import { IBaseFileProcessor } from "./index.type";
import { IBaseTextSplitter } from "../text_splitters/index.type";
import RecursiveTextSplitter from "../text_splitters/recursiveText.splitter";

abstract class AbstractFileProcessor implements IBaseFileProcessor {
  protected loadedDocuments: Document[] = [];

  protected setLoadedDocuments(loadedDocuments: Document[]): void {
    this.loadedDocuments = loadedDocuments;
  }

  public async load(): Promise<Document[]> {
    throw new Error("Method not implemented.");
  }

  public async split(textsplitterProcessor?: IBaseTextSplitter): Promise<Document[]> {
    try {
      const textsplitter: IBaseTextSplitter = textsplitterProcessor || new RecursiveTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
      });

      const splittedDocument = await textsplitter.splitDocuments(this.loadedDocuments);
      this.setLoadedDocuments(splittedDocument);

      return splittedDocument;
    } catch (error) {

      throw error;
    }
  }
  store(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export default AbstractFileProcessor;