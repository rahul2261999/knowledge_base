import { z } from 'zod'
class ValidationSchema {
  private constructor() { };

  public static readonly trainingMetaData = z.object({
    tenantId: z.string().nonempty("Tenant Id can not be empty"),
  });

  public static readonly MulterFile = z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number().refine((size) => size <= 5 * 1024 * 1024, {
      message: 'File size must be less than 5MB.',
    }),
    destination: z.string(),
    filename: z.string(),
    path: z.string(),
  })

  public static readonly uploadTrainingData = z.object({
    file: ValidationSchema.MulterFile,
    metaData: ValidationSchema.trainingMetaData
  })

  public static readonly bulkUploadTrainingData = z.object({
    files: z.array(ValidationSchema.MulterFile),
    metaData: ValidationSchema.trainingMetaData
  })

  public static readonly deleteTraininData = z.object({
    tenantId: z.string().nonempty("Tenant Id can not be empty"),
    documentId: z.string().nonempty("Document Id can not be empty"),
  })
  
}

export default ValidationSchema;