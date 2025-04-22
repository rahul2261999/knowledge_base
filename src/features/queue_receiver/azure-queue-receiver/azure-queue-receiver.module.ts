import { Module } from '@nestjs/common';
import { AzureQueueReceiverService } from './azure-queue-receiver.service';
import { FileProcessorModule } from '../../events/ingestion/file-processor.module';
import { AzureModule } from 'src/lib/azure/azure.module';
import { CrawlerModule } from 'src/features/crawler/crawler.module';
import { TriggerModule } from 'src/features/events/trigger/triggers.module';

@Module({
  imports: [CrawlerModule, FileProcessorModule, TriggerModule, AzureModule],
  providers: [AzureQueueReceiverService],
})
export class AzureQueueReceiverModule {}
