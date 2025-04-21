import { Test, TestingModule } from '@nestjs/testing';
import { AwsQueueReceiverService } from './aws-queue-receiver.service';

describe('QueueReceiverService', () => {
  let service: AwsQueueReceiverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsQueueReceiverService],
    }).compile();

    service = module.get<AwsQueueReceiverService>(AwsQueueReceiverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
