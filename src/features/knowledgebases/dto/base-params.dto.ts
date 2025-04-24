import { IsString } from 'class-validator';

export class BaseParamsDto {
  @IsString({
    message: 'knowledgebase Id should be string',
  })
  @IsString({ message: 'knowledgebase Id should be a valid UUID' })
  tenantId: string;
}
