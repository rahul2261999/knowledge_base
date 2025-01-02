import { FilterQuery } from "mongoose";
import docuemntEmbedding from "./document_embedding.model";
import { IDocumentEmbedding } from "./document_embedding.type";
import InternalServer from "../../../../utils/error/internal_server.error";
import loggerService from "../../../../utils/logger/logger.service";
import { ILoggerData } from "../../../../utils/logger/logger.type";

class DocumentEmbeddingRepo {
  private static instance: DocumentEmbeddingRepo;

  private constructor() { }

  public static getInstance(): DocumentEmbeddingRepo {
    if (!DocumentEmbeddingRepo.instance) {
      DocumentEmbeddingRepo.instance = new DocumentEmbeddingRepo();
    }
    return DocumentEmbeddingRepo.instance;
  }

  public async find(findOptions: FilterQuery<IDocumentEmbedding>): Promise<any> {
    const loggerData: ILoggerData = {
      serviceName: 'DocumentEmbeddingRepo',
      function: 'find',
      message: 'executing'
    }
    try {
      loggerService.info(loggerData);
      const documentEmbeddings = await docuemntEmbedding.find(findOptions);

      loggerData.message = 'execution complete'
      loggerService.info(loggerData);

      return documentEmbeddings;
    } catch (error) {
      loggerService.error(loggerData, { error: error as Error });

      throw new InternalServer("Something went wrong")
    }
  }

  public async deleteMany(findOptions: FilterQuery<IDocumentEmbedding>): Promise<any> {
    const loggerData: ILoggerData = {
      serviceName: 'DocumentEmbeddingRepo',
      function: 'deleteMany',
      message: 'executing'
    }
    try {
      loggerService.info(loggerData);
      const documentEmbeddings = await docuemntEmbedding.deleteMany(findOptions);

      loggerData.message = 'execution complete'
      loggerService.info(loggerData);

      return documentEmbeddings;
    } catch (error) {
      loggerService.error(loggerData, { error: error as Error });
      
      throw new InternalServer("Something went wrong")
    }
  }
}

export default DocumentEmbeddingRepo.getInstance();