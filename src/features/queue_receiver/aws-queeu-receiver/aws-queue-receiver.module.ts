import { Module } from '@nestjs/common';
import { AwsQueueReceiverService } from './aws-queue-receiver.service';
import { FileProcessorModule } from '../../events/ingestion/file-processor.module';
import { AwsModule } from 'src/lib/aws/aws.module';

@Module({
  imports: [AwsModule, FileProcessorModule],
  providers: [AwsQueueReceiverService],
})
export class QueueReceiverModule {}
