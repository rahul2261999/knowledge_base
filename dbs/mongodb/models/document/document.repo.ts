import { FilterQuery } from "mongoose";
import InternalServer from "../../../../utils/error/internal_server.error";
import loggerService from "../../../../utils/logger/logger.service";
import { ILoggerData } from "../../../../utils/logger/logger.type";
import { IDocument } from "./document.type";
import document from "./document.model";

class DocumentRepo {
  private static instance: DocumentRepo;

  private constructor() { }

  public static getInstance(): DocumentRepo {
    if (!DocumentRepo.instance) {
      DocumentRepo.instance = new DocumentRepo();
    }
    return DocumentRepo.instance;
  }

  public async create(doc: IDocument) {
    const loggerData: ILoggerData = {
      serviceName: 'DocumentRepo',
      function: 'create',
      message: 'executing'
    }
    try {
      loggerService.info(loggerData);
      const newDoc = await document.create(doc);

      loggerData.message = 'execution complete'
      loggerService.info(loggerData);

      return newDoc;
    } catch (error) {
      loggerService.error(loggerData, { error: error as Error });

      throw new InternalServer("Something went wrong")
    }
  }


  public async find(findOptions: FilterQuery<IDocument>) {
    const loggerData: ILoggerData = {
      serviceName: 'DocumentRepo',
      function: 'find',
      message: 'executing'
    }
    try {
      loggerService.info(loggerData);
      const doc = await document.find({ findOptions });

      loggerData.message = 'execution complete'
      loggerService.info(loggerData);

      return doc;
    } catch (error) {
      loggerService.error(loggerData, { error: error as Error });

      throw new InternalServer("Something went wrong")
    }
  }

  public async deleteOne(findOptions: string) {
    const loggerData: ILoggerData = {
      serviceName: 'DocumentRepo',
      function: 'deleteOne',
      message: 'executing'
    }
    try {
      loggerService.info(loggerData);
      const docs = await document.findByIdAndDelete(findOptions);

      loggerData.message = 'execution complete'
      loggerService.info(loggerData);

      return docs;
    } catch (error) {
      loggerService.error(loggerData, { error: error as Error });
      
      throw new InternalServer("Something went wrong")
    }
  }

  public async deleteMany(findOptions: FilterQuery<IDocument>) {
    const loggerData: ILoggerData = {
      serviceName: 'DocumentRepo',
      function: 'deleteMany',
      message: 'executing'
    }
    try {
      loggerService.info(loggerData);
      const docs = await document.deleteMany(findOptions);

      loggerData.message = 'execution complete'
      loggerService.info(loggerData);

      return docs;
    } catch (error) {
      loggerService.error(loggerData, { error: error as Error });
      
      throw new InternalServer("Something went wrong")
    }
  }
}

export default DocumentRepo.getInstance();