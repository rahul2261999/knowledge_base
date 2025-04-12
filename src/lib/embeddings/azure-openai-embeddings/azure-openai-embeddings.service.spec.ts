import { Test, TestingModule } from '@nestjs/testing';
import { AzureOpenaiEmbeddingsService } from './azure-openai-embeddings.service';

describe('AzureOpenaiEmbeddingsService', () => {
  let service: AzureOpenaiEmbeddingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AzureOpenaiEmbeddingsService],
    }).compile();

    service = module.get<AzureOpenaiEmbeddingsService>(
      AzureOpenaiEmbeddingsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
