/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Expose, Transform } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';
import { Status } from 'src/core/constants/global.enum';

export class KnowledgebaseResDto {
  @Expose({ name: '_id' })
  @Transform(({ obj }) => obj._id.toString())
  id: number;

  @Expose()
  tenantId: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsEnum(Status)
  status: Status;

  @Expose()
  createdBy: string;

  @Expose()
  updatedBy: string;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  createdAt: string;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  updatedAt: string;
}
