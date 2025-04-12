import { Module } from '@nestjs/common';
import { PineconeVectorStoreService } from './pinecone-vector-store.service';
import { AzureOpenaiEmbeddingsModule } from 'src/lib/embeddings/azure-openai-embeddings/azure-openai-embeddings.module';

@Module({
  imports: [AzureOpenaiEmbeddingsModule],
  providers: [PineconeVectorStoreService],
  exports: [PineconeVectorStoreService],
})
export class PineconeVectorStoreModule {}
