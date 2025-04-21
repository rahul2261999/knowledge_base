import { Test, TestingModule } from '@nestjs/testing';
import { AwsS3DownloadService } from './aws-s3-download.service';

describe('AwsS3DownloadService', () => {
  let service: AwsS3DownloadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsS3DownloadService],
    }).compile();

    service = module.get<AwsS3DownloadService>(AwsS3DownloadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
