import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsOptional()
  @IsString({})
  @Transform(({ value }) => value ?? 'general')
  
  bucketName: string;
}
