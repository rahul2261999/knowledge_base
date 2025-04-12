import { Expose, Transform } from 'class-transformer';
import { IsDate, IsEnum, IsString } from 'class-validator';
import { Status } from 'src/core/constants/global.enum';

export class KnowledgebaseResDto {
  @Expose({ name: '_id' })
  @Transform(({ obj }) => obj._id.toString())
  id: number;

  @Expose()
  knowledgebaseId: string;

  @Expose()
  @IsString()
  customerId: string;

  @Expose()
  userId: string;

  @Expose()
  @IsEnum(Status)
  status: Status;
  
  @Expose()
  @Transform(({ value }) => value.toISOString())
  createdAt: string;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  updatedAt: string;
}
