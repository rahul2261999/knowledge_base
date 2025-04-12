import { z } from "zod";
import { BucketValidation } from "./bucket.validation";

export type BucketCreateService = z.infer<typeof BucketValidation.CreateBucket>;
export type BucketUpdateService = z.infer<typeof BucketValidation.UpdateBucket>;
export type BucketDeleteService = z.infer<typeof BucketValidation.DeleteBucket>;
export type BucketGetService = z.infer<typeof BucketValidation.GetBucket>;
export type BUcketGetAllService = z.infer<typeof BucketValidation.GeAllBuckets>;