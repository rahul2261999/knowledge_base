import { Test, TestingModule } from '@nestjs/testing';
import { VoyageEmbeddingsService } from './voyage-embeddings.service';

describe('VoyageEmbeddingsService', () => {
  let service: VoyageEmbeddingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoyageEmbeddingsService],
    }).compile();

    service = module.get<VoyageEmbeddingsService>(VoyageEmbeddingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
