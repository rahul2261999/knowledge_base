import { IsString, IsUUID } from 'class-validator';

export class CreateKnowledgebaseDto {
  @IsString({
    message: 'knowledgebase Id should be string',
  })
  @IsUUID('all', { message: 'knowledgebase Id should be a valid UUID', })
  knowledgebaseId: string;

  @IsString({
    message: 'customer Id should be string',
  })
  customerId: string;

  @IsString({
    message: 'user Id should be string',
  })
  userId: string;
}
