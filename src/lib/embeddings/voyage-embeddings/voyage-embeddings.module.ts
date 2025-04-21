import { Module } from '@nestjs/common';
import { VoyageEmbeddingsService } from './voyage-embeddings.service';

@Module({
  imports: [],
  providers: [VoyageEmbeddingsService],
  exports: [VoyageEmbeddingsService],
})
export class VoyageEmbeddingsModule {}
