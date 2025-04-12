import { Document } from "@langchain/core/documents";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import constant from "../../constants/constant";
import mistralEmbeddings from "../../embeddings/mistral_embeddings";
import { BaseVectorStore, BaseGetRetriver } from "../base.interface";
import { ILoggerData } from "../../utils/logger/logger.type";
import loggerService from "../../utils/logger/logger.service";
import mongodbClient from "../../dbs/mongodb/mongodb-client";

class MongoVectorStore implements BaseVectorStore {

  public static instance: MongoVectorStore;

  private vectorStore!: MongoDBAtlasVectorSearch;

  private constructor() {}

  private async init () {
    const mongoClient = await mongodbClient.getInstance();
    const collection = mongoClient.getCollection(constant.mongo.collection)

    this.vectorStore = new MongoDBAtlasVectorSearch(
      mistralEmbeddings,
      {
        collection,
        indexName: 'mistral',
        embeddingKey: 'embedding',
        textKey: 'text'
      }
    );
  }
   
  public static async getInstance(): Promise<MongoVectorStore> {
    if (!MongoVectorStore.instance) {
      MongoVectorStore.instance = new MongoVectorStore();
      await MongoVectorStore.instance.init()
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

  public getStore() {
    return this.vectorStore;
  }
}

export default MongoVectorStore;