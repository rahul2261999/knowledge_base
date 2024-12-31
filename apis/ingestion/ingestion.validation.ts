import { z } from 'zod'
import { IUploadTrainingData } from './ingestion.type'
class ValidationSchema {
  private constructor() {};

  public static readonly trainingMetaData = z.object({
    tenantId: z.string().nonempty("Tenant Id can not be empty"),
  });

  public static readonly uploadTrainingData = z.object({
    file: z.instanceof(File),
    metaData: ValidationSchema.trainingMetaData
  })
}

export default ValidationSchema;