import { Module } from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';
import { AwsS3DownloadService } from './aws-s3-download.service';

@Module({
  providers: [AwsS3Service, AwsS3DownloadService],
  exports: [AwsS3Service],
})
export class AwsS3Module {}
