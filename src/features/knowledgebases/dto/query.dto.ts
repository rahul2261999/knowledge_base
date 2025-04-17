/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Transform } from 'class-transformer';
import { IsString, IsOptional, Length, IsNotEmpty } from 'class-validator';

export class QueryDto {
  @IsNotEmpty({ message: 'Bucket name is required' })
  @IsString({ message: 'Bucket name must be a string' })
  @Transform(({ value }) => value.toLowerCase())
  bucketName: string = 'all';

  @IsOptional()
  @IsString({ message: 'Conversation ID should be a string' })
  conversationId?: string;

  @IsNotEmpty({ message: 'Query is required' })
  @IsString({ message: 'Query must be a string' })
  @Length(3, 1000, { message: 'Query must be between 3 and 1000 characters' })
  query: string;
}
