import { IsString } from 'class-validator';
import { BaseParamsDto } from './base-params.dto';

export class FindKnowledgebaseDto extends BaseParamsDto {
  @IsString({
    message: 'knowledgebase Id should be string',
  })
  knowledgebaseId: string;
}
