import { CrawlDto } from './dto/crawler.dto';

export interface Crawling extends CrawlDto {
  crawlingSessionId: string;
}

export interface ExtractedUrl {
  url: string;
  lastModified?: string;
  changeFrequency?: number;
  priority?: string;
}
