import { z } from "zod";
import { BucketStatus } from "../../dbs/mongodb/models/buckets/bucket.type";

abstract class BucketValidation {
  public static readonly CreateBucket = z.object({
    name: z.string()
      .nonempty("Bucket name can not be empty")
      .min(3,
        "Bucket name must be at least 3 characters long"
      ),
    tenantId: z.string().nonempty("Tenant Id can not be empty"),
    status: z.nativeEnum(BucketStatus),
    createdBy: z.number(),
  })

  public static readonly UpdateBucket = z.object({
    values: z.object({
      name: z.string()
        .nonempty("Bucket name can not be empty")
        .min(3,
          "Bucket name must be at least 3 characters long"
        ).optional(),
      status: z.nativeEnum(BucketStatus).optional(),
      updatedBy: z.number(),

    }),
    filters: z.object({
      bucketId: z.string().nonempty("Bucket Id can not be empty"),
      tenantId: z.string().nonempty("Tenant Id can not be empty"),
    })
  })

  public static readonly DeleteBucket = z.object({
    tenantId: z.string().nonempty("Tenant Id can not be empty"),
    bucketId: z.string().nonempty("Bucket Id can not be empty"),
  })

  public static readonly GetBucket = z.object({
    tenantId: z.string().nonempty("Tenant Id can not be empty"),
    bucketId: z.string().nonempty("Bucket Id can not be empty"),
  })

  public static readonly GeAllBuckets = z.object({
    tenantId: z.string().nonempty("Tenant Id can not be empty"),
  })
}

export { BucketValidation }