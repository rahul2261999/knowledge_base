import { Module } from '@nestjs/common';
import { PineconeVectorStoreService } from './pinecone-vector-store.service';
import { EmbeddingsModule } from 'src/lib/embeddings/embeddings.module';

@Module({
  imports: [EmbeddingsModule],
  providers: [PineconeVectorStoreService],
  exports: [PineconeVectorStoreService],
})
export class PineconeVectorStoreModule {}
