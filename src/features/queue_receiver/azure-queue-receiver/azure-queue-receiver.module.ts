import { Module } from '@nestjs/common';
import { AzureQueueReceiverService } from './azure-queue-receiver.service';
import { FileProcessorModule } from '../../events/ingestion/file-processor.module';
import { AzureModule } from 'src/lib/azure/azure.module';

@Module({
  imports: [FileProcessorModule, AzureModule],
  providers: [AzureQueueReceiverService],
})
export class AzureQueueReceiverModule {}
