import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUrl,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CrawlDto {
  @IsString({
    always: true,
    message: 'webiste Id is required and must be a string',
  })
  websiteId: string;

  @IsString({
    always: true,
    message: 'URL must be a string',
  })
  @IsUrl({}, { message: 'URL must be a valid URL' })
  url: string;

  @IsOptional()
  @Min(1)
  @Max(5)
  @IsNumber()
  @Transform(({ value }) => (value === undefined ? 2 : value))
  depth: number;
}
