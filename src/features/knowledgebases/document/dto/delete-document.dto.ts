import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteDocumentDto {
  @IsNotEmpty({ message: 'document id is required' })
  documentId: string;
}
