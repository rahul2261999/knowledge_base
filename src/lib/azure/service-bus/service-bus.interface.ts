export interface CrawlContentQueuePayload {
  url: string;
  tag: string;
  knowledgebaseId: string;
  crawlingSessionId: string;
  crawlingUrlId: string;
  tracingId: string;
}

export interface ProcessIncomingFileAttrs {
  tracingId: string;
  [key: string]: unknown;
}
