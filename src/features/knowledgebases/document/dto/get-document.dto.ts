import { IsNotEmpty } from 'class-validator';

export class GetDocumentDto {
  @IsNotEmpty({ message: 'document id is required' })
  documentId: string;
}
