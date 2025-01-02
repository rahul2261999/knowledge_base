import { Document } from "@langchain/core/documents";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import constant from "../../constants/constant";
import mistralEmbeddings from "../../embeddings/mistral_embeddings";
import { BaseVectorStore, BaseGetRetriver } from "../base.interface";
import { ILoggerData } from "../../utils/logger/logger.type";
import loggerService from "../../utils/logger/logger.service";
import mongoVectoreStoreDb from "../../dbs/mongodb/mongoose_client";

class MongoVectorStore implements BaseVectorStore {

  public static instance: MongoVectorStore;

  private vectorStore: MongoDBAtlasVectorSearch;

  private constructor() {
    this.vectorStore = new MongoDBAtlasVectorSearch(
      mistralEmbeddings,
      {
        collection: mongoVectoreStoreDb.getCollection(constant.mongo.collection),
        indexName: 'mistral',
        embeddingKey: 'embedding',
        textKey: 'text'
      }
    );
  }
   
  public static getInstance(): MongoVectorStore {
    if (!MongoVectorStore.instance) {
      MongoVectorStore.instance = new MongoVectorStore();
    }
    return MongoVectorStore.instance;
  }

  public async addDocuments(params: Document[], docIds?: string[]) {
    const loggerData: ILoggerData = {
      serviceName: 'MongoVectorStore',
      function: 'addDocuments',
      message: 'executing'
    }
    try {
     loggerService.info(loggerData);

      await this.vectorStore.addDocuments(params, { ids: docIds });

      loggerData.message = 'execution complete'
      loggerService.info(loggerData);
    } catch (error) {
      loggerService.error(loggerData, { error: error as Error });

      throw new Error("Something went wrong when adding documents");
    }
  }
  public getRetriver(params?: BaseGetRetriver) {
    const kfileds: number | undefined = params?.k || undefined;
    const filter = params?.filter || {};
    
    return this.vectorStore.asRetriever(kfileds, filter)
  }
}

export default MongoVectorStore.getInstance();