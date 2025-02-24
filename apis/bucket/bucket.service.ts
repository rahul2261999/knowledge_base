import mongoose from "mongoose";
import bucketRepo from "../../dbs/mongodb/models/buckets/bucket.repo";
import { IBucket, UpdateBucket } from "../../dbs/mongodb/models/buckets/bucket.type";
import BadRequest from "../../utils/error/bad_request";
import InternalServer from "../../utils/error/internal_server.error";
import loggerService from "../../utils/logger/logger.service";
import { ILoggerData } from "../../utils/logger/logger.type";
import { BucketCreateService, BUcketGetAllService, BucketGetService, BucketUpdateService, BucketDeleteService } from "./bucket.type";
import { BucketValidation } from "./bucket.validation";
import NotFound from "../../utils/error/not_found";

class BucketService {
  private static instance: BucketService;

  private constructor() { }

  public static getInstance(): BucketService {
    if (!BucketService.instance) {
      BucketService.instance = new BucketService();
    }
    return BucketService.instance;
  }

  public async bucketCreate(params: BucketCreateService): Promise<IBucket> {
    const loggerData: ILoggerData = {
      serviceName: 'BucketService',
      function: 'bucketCreate',
    };

    try {
      loggerService.info({ ...loggerData, message: 'executing' });

      const validation = BucketValidation.CreateBucket.safeParse(params);

      if (!validation.success) {
        throw new BadRequest(validation.error.message, { error: validation.error.issues })
      }

      const createdBucket = await bucketRepo.create({
        name: params.name,
        tenantId: params.tenantId,
        status: params.status,
        createdBy: params.createdBy,
        updatedBy: null,
      })


      loggerService.info({ ...loggerData, message: 'executed' });

      return createdBucket?.toJSON();
    } catch (error) {
      loggerService.error({ ...loggerData, message: 'failed to execute' });

      throw InternalServer.fromError(error);
    }
  }


  public async bucketGet(params: BucketGetService): Promise<IBucket | undefined> {
    const loggerData: ILoggerData = {
      serviceName: 'BucketService',
      function: 'bucketGet',
    };

    try {
      loggerService.info({ ...loggerData, message: 'executing' });

      const validation = BucketValidation.GetBucket.safeParse(params);

      if (!validation.success) {
        throw new BadRequest(validation.error.message, { error: validation.error.issues })
      }

      const bucket = await bucketRepo.findOne({
        _id: new mongoose.Types.ObjectId(params.bucketId),
        tenantId: params.tenantId,
      })

      loggerService.info({ ...loggerData, message: 'executed' });

      return bucket?.toJSON();
    } catch (error) {
      loggerService.error({ ...loggerData, message: 'failed to execute' });

      throw InternalServer.fromError(error);
    }
  }

  public async bucketGetAll(params: BUcketGetAllService): Promise<IBucket[]> {
    const loggerData: ILoggerData = {
      serviceName: 'BucketService',
      function: 'bucketGetAll',
    };

    try {
      loggerService.info({ ...loggerData, message: 'executing' });

      const validation = BucketValidation.GeAllBuckets.safeParse(params);

      if (!validation.success) {
        throw new BadRequest(validation.error.message, { error: validation.error.issues })
      }

      const buckets = await bucketRepo.find({
        tenantId: params.tenantId,
      })

      loggerService.info({ ...loggerData, message: 'executed' });

      return buckets.map(bucket => bucket.toJSON());
    } catch (error) {
      loggerService.error({ ...loggerData, message: 'failed to execute' });

      throw InternalServer.fromError(error);
    }
  }

  public async bucketUpdate(params: BucketUpdateService): Promise<IBucket> {
    const loggerData: ILoggerData = {
      serviceName: 'BucketService',
      function: 'bucketUpdate',
    };

    try {
      loggerService.info({ ...loggerData, message: 'executing' });

      const validation = BucketValidation.UpdateBucket.safeParse(params);

      if (!validation.success) {
        throw new BadRequest(validation.error.message, { error: validation.error.issues })
      }

      const bucket = await this.bucketGet({
        bucketId: params.filters.bucketId,
        tenantId: params.filters.tenantId,
      })

      if (!bucket) {
        throw new NotFound('Bucket not found');
      }

      const bucketUpdateValues: UpdateBucket = {
        updatedBy: params.values.updatedBy,
        updatedAt: new Date(),
      };

      if (params.values.name) {
        bucketUpdateValues.name = params.values.name;
      }

      if (params.values.status) {
        bucketUpdateValues.status = params.values.status;
      }

      const updatedBucket = await bucketRepo.update(
        {
          _id: new mongoose.Types.ObjectId(params.filters.bucketId),
          tenantId: params.filters.tenantId,
        },
        bucketUpdateValues
      );

      loggerService.debug(`Updated bucket modifiedCount: ${updatedBucket.modifiedCount}`)
      loggerService.info({ ...loggerData, message: 'executed' });

      const modifiedBucket: IBucket = {
        ...bucket,
        ...bucketUpdateValues
      }

      return modifiedBucket;
    } catch (error) {
      loggerService.error({ ...loggerData, message: 'failed to execute' });

      throw InternalServer.fromError(error);
    }
  }

  public async bucketDelete(params: BucketDeleteService): Promise<{ deletedCount: number }> {
    const loggerData: ILoggerData = {
      serviceName: 'BucketService',
      function: 'bucketDelete',
    };

    try {
      loggerService.info({ ...loggerData, message: 'executing' });

      const validation = BucketValidation.GetBucket.safeParse(params);

      if (!validation.success) {
        throw new BadRequest(validation.error.message, { error: validation.error.issues })
      }

      const deletedBucket = await bucketRepo.deleteOne({
        _id: new mongoose.Types.ObjectId(params.bucketId),
        tenantId: params.tenantId,
      })

      loggerService.debug(`Deleted bucket count: ${deletedBucket.deletedCount}`)
      loggerService.info({ ...loggerData, message: 'executed' });

      return { deletedCount: deletedBucket.deletedCount };
    } catch (error) {
      loggerService.error({ ...loggerData, message: 'failed to execute' });

      throw InternalServer.fromError(error);
    }
  }

}

export default BucketService.getInstance();