import { Module } from '@nestjs/common';
import { QueueReceiverService } from './queue-receiver.service';
import { AwsSqsModule } from 'src/lib/aws_sqs/aws-sqs.module';
import { FileProcessorModule } from '../events/ingestion/file-processor.module';

@Module({
  imports: [AwsSqsModule, FileProcessorModule],
  providers: [QueueReceiverService],
})
export class QueueReceiverModule {}
