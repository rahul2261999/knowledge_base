import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgebasesService } from './knowledgebases.service';

describe('KnowledgebasesService', () => {
  let service: KnowledgebasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgebasesService],
    }).compile();

    service = module.get<KnowledgebasesService>(KnowledgebasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
