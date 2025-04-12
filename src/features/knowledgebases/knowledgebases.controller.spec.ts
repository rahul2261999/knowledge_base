import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgebasesController } from './knowledgebases.controller';
import { KnowledgebasesService } from './knowledgebases.service';

describe('KnowledgebasesController', () => {
  let controller: KnowledgebasesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KnowledgebasesController],
      providers: [KnowledgebasesService],
    }).compile();

    controller = module.get<KnowledgebasesController>(KnowledgebasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
