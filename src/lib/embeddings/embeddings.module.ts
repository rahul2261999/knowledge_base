import { Module } from '@nestjs/common';
import { VoyageEmbeddingsModule } from './voyage-embeddings/voyage-embeddings.module';
import { AzureOpenaiEmbeddingsModule } from './azure-openai-embeddings/azure-openai-embeddings.module';

@Module({
  imports: [AzureOpenaiEmbeddingsModule, VoyageEmbeddingsModule],
})
export class EmbeddingsModule {}
