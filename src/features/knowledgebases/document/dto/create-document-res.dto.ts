import { Expose, Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ProcessingStatus, Status } from 'src/core/constants/global.enum';

export class CreateDocumentResDto {
  @Expose({ name: '_id' })
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @Expose()
  tenantId: string;

  @Expose()
  knowledgebaseId: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsNumber()
  size: number;

  @Expose()
  @IsString()
  bucketName: string;

  @Expose()
  @IsEnum(ProcessingStatus)
  processingStatus: string;

  @Expose()
  @IsEnum(Status)
  status: Status;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  @IsString()
  createdAt: string;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  @IsString()
  updatedAt: string;

  @Expose()
  @IsOptional()
  @IsString()
  createdBy?: string;

  @Expose()
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
