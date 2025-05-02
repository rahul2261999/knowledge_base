/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Expose, Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { VectorDocumentSource } from 'src/core/constants/global.enum';

export class QueryResponseDto {
  // @Expose()
  id: string;

  @Expose()
  @Transform(({ obj }) => obj.metadata.text)
  text: string;

  @Expose()
  @Transform(({ obj }) => obj.metadata.tag)
  tag: string;

  @Expose()
  @Transform(({ obj }) => obj.metadata.source)
  @IsEnum(VectorDocumentSource)
  source: string;

  @Expose({ name: 'score' })
  relevanceScore: number;
}
