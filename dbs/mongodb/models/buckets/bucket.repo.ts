import { FilterQuery } from "mongoose";
import InternalServer from "../../../../utils/error/internal_server.error";
import loggerService from "../../../../utils/logger/logger.service";
import { ILoggerData } from "../../../../utils/logger/logger.type";
import { CreateBucket, IBucket, UpdateBucket } from "./bucket.type";
import Bucket from "./bucket.model";

class BucketRepo {
  private static instance: BucketRepo;

  private constructor() { }

  public static getInstance(): BucketRepo {
    if (!BucketRepo.instance) {
      BucketRepo.instance = new BucketRepo();
    }
    return BucketRepo.instance;
  }

  public async create(doc: CreateBucket) {
    const loggerData: ILoggerData = {
      serviceName: 'BucketRepo',
      function: 'create',
      message: 'executing'
    }
    try {
      loggerService.info(loggerData);
      const newDoc = await Bucket.create(doc);

      loggerData.message = 'execution complete'
      loggerService.info(loggerData);

      return newDoc;
    } catch (error) {
      loggerService.error(loggerData, { error: error as Error });

      throw new InternalServer("Something went wrong")
    }
  }

  public async findOne(findOptions: FilterQuery<IBucket>) {
    const loggerData: ILoggerData = {
      serviceName: 'BucketRepo',
      function: 'findOne',
      message: 'executing'
    }
    try {
      loggerService.info(loggerData);
      const doc = await Bucket.findOne(findOptions);

      loggerData.message = 'execution complete'
      loggerService.info(loggerData);

      return doc;
    } catch (error) {
      loggerService.error(loggerData, { error: error as Error });

      throw new InternalServer("Something went wrong")
    }
  }

  public async find(findOptions: FilterQuery<IBucket>) {
    const loggerData: ILoggerData = {
      serviceName: 'BucketRepo',
      function: 'find',
      message: 'executing'
    }
    try {
      loggerService.info(loggerData);
      const doc = await Bucket.find(findOptions);

      loggerData.message = 'execution complete'
      loggerService.info(loggerData);

      return doc;
    } catch (error) {
      loggerService.error(loggerData, { error: error as Error });

      throw new InternalServer("Something went wrong")
    }
  }

  public async update(findOptions: FilterQuery<IBucket>, values: UpdateBucket) {
    const loggerData: ILoggerData = {
      serviceName: 'BucketRepo',
      function: 'update',
      message: 'executing'
    }
    try {
      loggerService.info(loggerData);
      const doc = await Bucket.updateOne(findOptions, values);

      loggerData.message = 'execution complete'
      loggerService.info(loggerData);

      return doc;
    } catch (error) {
      loggerService.error(loggerData, { error: error as Error });

      throw new InternalServer("Something went wrong")
    }
  }

  public async deleteOne(findOptions: FilterQuery<IBucket>) {
    const loggerData: ILoggerData = {
      serviceName: 'BucketRepo',
      function: 'deleteOne',
      message: 'executing'
    }
    try {
      loggerService.info(loggerData);

      const docs = await Bucket.deleteOne(findOptions);

      loggerData.message = 'execution complete'
      loggerService.info(loggerData);

      return docs;
    } catch (error) {
      loggerService.error(loggerData, { error: error as Error });

      throw new InternalServer("Something went wrong")
    }
  }

  public async deleteMany(findOptions: FilterQuery<IBucket>) {
    const loggerData: ILoggerData = {
      serviceName: 'BucketRepo',
      function: 'deleteMany',
      message: 'executing'
    }
    try {
      loggerService.info(loggerData);
      const docs = await Bucket.deleteMany(findOptions);

      loggerData.message = 'execution complete'
      loggerService.info(loggerData);

      return docs;
    } catch (error) {
      loggerService.error(loggerData, { error: error as Error });

      throw new InternalServer("Something went wrong")
    }
  }
}

export default BucketRepo.getInstance();