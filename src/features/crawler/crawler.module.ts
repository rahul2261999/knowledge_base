import { Module } from '@nestjs/common';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CrawlingSession,
  CrawlingSessionSchema,
} from './schemas/crawling-session.model';
import { CrawledUrl, CrawledUrlSchema } from './schemas/crawled-url.model';
import { CrawledUrlRepo } from './repo/crawled-url.repo';
import { CrawlingSessionRepo } from './repo/crawling-session.repo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CrawlingSession.name, schema: CrawlingSessionSchema },
      { name: CrawledUrl.name, schema: CrawledUrlSchema },
    ]),
  ],
  controllers: [CrawlerController],
  providers: [CrawlerService, CrawlingSessionRepo, CrawledUrlRepo],
})
export class CrawlerModule {}
