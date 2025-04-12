export interface Crawling {
  crawlingSessionId: string;
  url: URL;
  depth: number;
}

export interface ExtractedUrl {
  url: string;
  lastModified?: string;
  changeFrequency?: number;
  priority?: string;
}

export interface CrawlContentQueuePayload {
  url: string;
  crawlingSessionId: string;
  crawlingUrlId: string;
}
