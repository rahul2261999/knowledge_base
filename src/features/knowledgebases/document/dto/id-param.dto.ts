import { IsString, IsUUID } from 'class-validator';

export class KnowledgebaseIdParamDto {
  @IsString()
  @IsUUID()
  knowledgebaseId: string;
}
