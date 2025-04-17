export interface IProcessIncomingFileAttrs {
  tracingId: string;
  knowledgebaseId: string;
  documentId: string;
}

export interface ProcessWebpage {
  tracingId?: string;
  storageBucketName: string;
  storagePath: string;
  knowledgebaseId: string;
  crawlUrlId: string;
  crawlingSessionId: string;
  url: string;
  bucketName: string;
}
