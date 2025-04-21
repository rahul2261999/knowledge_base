import { MessageAttributeValue } from '@aws-sdk/client-sqs';

export interface MessageAttributes {
  attributes: {
    [key: string]: MessageAttributeValue;
  };
}

export interface DefaultMessage extends MessageAttributes {
  body?: Record<string, any> | undefined;
}

export interface CrawlContentQueuePayload {
  tracingId?: string;
  url: string;
  bucketName: string;
  knowledgebaseId: string;
  crawlingSessionId: string;
  crawlingUrlId: string;
}

export interface CrawlContentQueueMessage extends Partial<MessageAttributes> {
  body: CrawlContentQueuePayload;
}

export type SqsMessage = DefaultMessage | CrawlContentQueueMessage;
