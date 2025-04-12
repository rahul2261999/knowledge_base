import { IsNotEmpty } from 'class-validator';

export class GetWebsiteDto {
  @IsNotEmpty({ message: 'document id is required' })
  websiteId: string;
}
