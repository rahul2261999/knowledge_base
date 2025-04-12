import { IsString, IsUUID } from 'class-validator';

export class DocumentBaseParamsDto {
  @IsString({
    message: 'tenantId should be string',
  })
  tenantId: string;

  @IsString({
    message: 'knowledgebase Id should be string',
  })
  knowledgebaseId: string;
}
