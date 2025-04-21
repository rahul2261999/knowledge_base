import { Module } from '@nestjs/common';
import { FileProcessorEvents } from './file-processor.event';
import { KnowledgebasesModule } from '../../knowledgebases/knowledgebases.module';
import { PineconeVectorStoreModule } from 'src/lib/vector_store/pinecone/pinecone-vector-store.module';
import { AzureModule } from 'src/lib/azure/azure.module';

@Module({
  imports: [KnowledgebasesModule, AzureModule, PineconeVectorStoreModule],
  providers: [FileProcessorEvents],
  exports: [FileProcessorEvents],
})
export class FileProcessorModule {}
