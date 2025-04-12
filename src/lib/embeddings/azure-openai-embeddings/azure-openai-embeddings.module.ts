import { Module } from '@nestjs/common';
import { AzureOpenaiEmbeddingsService } from './azure-openai-embeddings.service';

@Module({
  providers: [AzureOpenaiEmbeddingsService],
  exports: [AzureOpenaiEmbeddingsService],
})
export class AzureOpenaiEmbeddingsModule {}
