import { MessageHandlers as AzureMessageHandlers } from '@azure/service-bus';

export interface ServiceBusMessageOptions {
  body: unknown;
  applicationProperties?: Record<string, unknown>;
}

export interface BatchResult {
  successful: number;
}

export type MessageHandlers = AzureMessageHandlers;

export interface ServiceBusReceiverOptions {
  maxConcurrentCalls?: number;
  processError?: (error: Error) => Promise<void>;
}
