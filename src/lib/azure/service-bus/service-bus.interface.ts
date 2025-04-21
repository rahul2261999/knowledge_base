export interface CrawlContentQueuePayload {
  url: string;
  bucketName: string;
  knowledgebaseId: string;
  crawlingSessionId: string;
  crawlingUrlId: string;
  tracingId: string;
}

export interface ProcessIncomingFileAttrs {
  tracingId: string;
  [key: string]: unknown;
}
