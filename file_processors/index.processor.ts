import { Document } from "@langchain/core/documents";
import { IBaseFileProcessor, IStoreOpions } from "./index.type";
import { IBaseTextSplitter } from "../text_splitters/index.type";
import RecursiveTextSplitter from "../text_splitters/recursiveText.splitter";
import mongoVectorStore from "../vector_stores/mongoVectorStore/mongoVectorStore";
import loggerService from "../utils/logger/logger.service";
import { ILoggerData } from "../utils/logger/logger.type";

abstract class AbstractFileProcessor implements IBaseFileProcessor {
  protected originalDocuments: Document[] = [];
  protected parsedDocuemnts: Document[] = [];

  protected setOriginalDocuments(documents: Document[]): void {
    this.originalDocuments = documents;
  }

  protected setParsedDocuemnts(documents: Document[]): void {
    this.parsedDocuemnts = documents;
  }

  public getOriginalDocuments(): Document[] {
    return this.originalDocuments;
  }

  public getParsedDocuments(): Document[] {
    return this.parsedDocuemnts;
  }

  public async load(): Promise<IBaseFileProcessor> {
    throw new Error("Method not implemented.");
  }

  public async split(textsplitterProcessor?: IBaseTextSplitter): Promise<IBaseFileProcessor> {
    const loggerData: ILoggerData = {
      serviceName: 'AbstractFileProcessor',
      function:'split',
      message: 'executing'
    }

    try {
      loggerService.info(loggerData);

      const textsplitter: IBaseTextSplitter = textsplitterProcessor || new RecursiveTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
      });

      const parsedDocuemnts = await textsplitter.splitDocuments(this.originalDocuments);
      this.setParsedDocuemnts(parsedDocuemnts);

      loggerData.message = 'execution completed'
      loggerService.info(loggerData);

      return this;
    } catch (error) {
      loggerService.error(loggerData);
      
      throw error;
    }
  }
  public async store(options?: IStoreOpions): Promise<void> {
    const loggerData: ILoggerData = {
      serviceName: 'AbstractFileProcessor',
      function:'store',
      message: 'executing'
    }
    try {
      loggerService.info(loggerData);

      const documents = this.parsedDocuemnts.map(doc => {
        doc.metadata = {
          ...doc.metadata,
          ...options?.fileMetaData
        };

        return doc
      });

      const vectorStore = options?.storeInstance || mongoVectorStore;

      await vectorStore.addDocuments(documents);

      loggerData.message = 'execution complete'
      loggerService.info(loggerData);
    } catch (error) {
      loggerService.error(loggerData, { error: error as Error });

      throw error;
    }
  }
}

export default AbstractFileProcessor;