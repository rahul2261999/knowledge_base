import { Test, TestingModule } from '@nestjs/testing';
import { AzureQueueReceiverService } from './azure-queue-receiver.service';

describe('QueueReceiverService', () => {
  let service: AzureQueueReceiverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AzureQueueReceiverService],
    }).compile();

    service = module.get<AzureQueueReceiverService>(AzureQueueReceiverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
