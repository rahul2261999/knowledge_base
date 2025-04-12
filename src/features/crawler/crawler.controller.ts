import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlDto } from './dto/crawler.dto';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) { }

  @Post('crawl')
  async crawl(@Body() crawlDto: CrawlDto) {
    await this.crawlerService.crawl(crawlDto);
    
    return { message: 'Crawling started successfully' };
  }
}
