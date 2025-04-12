import { Test, TestingModule } from '@nestjs/testing';
import { QueueReceiverService } from './queue-receiver.service';

describe('QueueReceiverService', () => {
  let service: QueueReceiverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueReceiverService],
    }).compile();

    service = module.get<QueueReceiverService>(QueueReceiverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
