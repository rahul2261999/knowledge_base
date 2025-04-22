import { Module } from '@nestjs/common';
import { AwsQueueReceiverService } from './aws-queue-receiver.service';
import { FileProcessorModule } from '../../events/ingestion/file-processor.module';
import { AwsModule } from 'src/lib/aws/aws.module';
import { TriggerModule } from 'src/features/events/trigger/triggers.module';
import { CrawlerModule } from 'src/features/crawler/crawler.module';

@Module({
  imports: [AwsModule, FileProcessorModule, TriggerModule, CrawlerModule],
  providers: [AwsQueueReceiverService],
})
export class AwsQueueReceiverModule {}
