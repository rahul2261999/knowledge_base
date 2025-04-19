import { IsString } from 'class-validator';

export class CreateKnowledgebaseDto {
  @IsString({
    message: 'name should be string',
  })
  name: string;
}
