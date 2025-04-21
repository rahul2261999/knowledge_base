import { Module } from '@nestjs/common';
import { AwsSqsModule } from './aws_sqs/aws-sqs.module';
import { AwsS3Module } from './aws_s3/aws-s3.module';

@Module({
  imports: [AwsSqsModule, AwsS3Module],
  providers: [],
  exports: [AwsSqsModule, AwsS3Module],
})
export class AwsModule {}
