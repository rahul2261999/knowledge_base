import { Expose, Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class CreateWebsiteResDto {
  @Expose({ name: '_id' })
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @Expose()
  tenantId: string;

  @Expose()
  knowledgebaseId: string;

  @Expose()
  url: string;

  @Expose()
  depth: number;

  @Expose()
  processingStatus: string;

  @Expose()
  status: string;

  @Expose()
  createdBy: string | null;

  @Expose()
  updatedBy: string | null;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  @IsString()
  createdAt: string;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  @IsString()
  updatedAt: string;
}
