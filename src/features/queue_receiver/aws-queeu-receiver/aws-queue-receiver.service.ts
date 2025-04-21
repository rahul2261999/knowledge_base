import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AlsService } from 'src/core/common/als/als.service';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import InternalServer from 'src/core/error/internal-server.error';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';
import mongoose from 'mongoose';
import { CrawledUrlStatus } from 'src/core/constants/global.enum';
import { CrawlerService } from '../../crawler/crawler.service';
import { CrawledUrlRepo } from '../../crawler/repo/crawled-url.repo';
import { ProcessWebpage } from '../../events/events.type';
import { TriggerService } from '../../events/trigger/triggers.service';
import { EFileProcessorEvents } from '../../events/events.enum';
import { IProcessIncomingFileAttrs } from 'src/lib/file_processors/index.type';
import { ServiceBusService } from 'src/lib/azure/service-bus/service-bus.service';

import { AwsSqsService } from 'src/lib/aws/aws_sqs/aws-sqs.service';
import { CrawlContentQueuePayload } from 'src/lib/azure/service-bus/service-bus.interface';

@Injectable()
export class AwsQueueReceiverService implements OnApplicationBootstrap {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 5000;

  constructor(
    private readonly loggerService: LoggingService,
    private readonly awsSqsService: AwsSqsService,
    private readonly configurationService: ConfigurationService,
    private readonly alsService: AlsService,
    private readonly crawlerService: CrawlerService,
    private readonly triggerService: TriggerService,
    private readonly crawledUrlRepo: CrawledUrlRepo,
    private readonly serviceBusService: ServiceBusService,
  ) {}

  // This method will be called once the application is ready
  async onApplicationBootstrap() {
    this.loggerService.info({
      serviceName: 'QueueReceiverService',
      function: 'onApplicationBootstrap',
      message: 'Starting queue receiver service',
    });

    // Start the queue processing in the background
    await this.startQueueProcessing().catch((error) => {
      this.loggerService.error(
        {
          serviceName: 'QueueReceiverService',
          function: 'onApplicationBootstrap',
          message: 'Failed to start queue processing',
        },
        { error },
      );
    });
  }

  private async startQueueProcessing() {
    while (true) {
      try {
        // await this.fileProcessingQueue();
        // await this.contentQueue();
      } catch (error) {
        this.loggerService.error(
          {
            serviceName: 'QueueReceiverService',
            function: 'startQueueProcessing',
            message: 'Queue processing failed, restarting...',
          },
          { error },
        );

        // Wait before restarting to prevent rapid restart loops
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  public async fileProcessingQueue() {
    const loggerData: ILoggerData = {
      serviceName: 'QueueReceiverService',
      function: 'fileProcessingQueue',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const queueNames = this.configurationService.getAwsQueueNames();
      const queueUrl = await this.awsSqsService.getQueue(
        queueNames.FileProcessingQueue,
      );

      if (!queueUrl) {
        throw new InternalServer('Queue is not configured');
      }

      // Process messages endlessly
      while (true) {
        try {
          // Receive up to 10 messages
          const response = await this.awsSqsService.receiveMessage(queueUrl);

          if (response.Messages && response.Messages.length > 0) {
            // Process messages concurrently using Promise.all
            const successfulMessages: {
              Id: string | undefined;
              ReceiptHandle: string;
            }[] = [];

            const processingPromises = response.Messages.map(
              (message) =>
                // Wrap runContext in a new Promise that we can resolve/reject
                new Promise<{
                  success: boolean;
                  messageId: string | undefined;
                }>((resolve) => {
                  this.alsService.runContext(new Map(), async () => {
                    if (!message.Body || !message.ReceiptHandle) {
                      this.loggerService.error({
                        ...loggerData,
                        message: `Invalid message received: ${message.MessageId}`,
                      });

                      resolve({ success: true, messageId: message.MessageId });

                      return;
                    }

                    try {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      const messageBody: IProcessIncomingFileAttrs = JSON.parse(
                        message.Body,
                      );
                      this.alsService.setTraceId(messageBody.tracingId);

                      const receiveCount = parseInt(
                        message.MessageAttributes?.ApproximateReceiveCount
                          .StringValue || '0',
                      );

                      if (receiveCount >= this.MAX_RETRIES) {
                        // Add to successful messages for deletion even if max retries reached
                        successfulMessages.push({
                          Id: message.MessageId,
                          ReceiptHandle: message.ReceiptHandle,
                        });

                        this.loggerService.warn({
                          ...loggerData,
                          message: `Message ${message.MessageId} exceeded retry limit (${this.MAX_RETRIES}).`,
                        });

                        resolve({
                          success: true,
                          messageId: message.MessageId,
                        });

                        return;
                      }

                      // Process the message
                      // await this.fileProcessorEvents.processFile(messageBody);

                      // If processing successful, add to batch delete list
                      successfulMessages.push({
                        Id: message.MessageId,
                        ReceiptHandle: message.ReceiptHandle,
                      });

                      this.loggerService.debug({
                        ...loggerData,
                        message: `Successfully processed message: ${message.MessageId}`,
                      });

                      resolve({ success: true, messageId: message.MessageId });
                    } catch (error) {
                      this.loggerService.error(
                        {
                          ...loggerData,
                          message: `Error processing message: ${message.MessageId}`,
                        },
                        { error },
                      );

                      // Handle retry logic for failed message
                      try {
                        await this.awsSqsService.changeMessageVisibility(
                          queueUrl,
                          message.ReceiptHandle,
                          0,
                        );
                      } catch (visibilityError) {
                        this.loggerService.error(
                          {
                            ...loggerData,
                            message: `Error returning message to queue: ${message.MessageId}`,
                          },
                          { error: visibilityError },
                        );
                      }

                      resolve({ success: false, messageId: message.MessageId });
                    }
                  });
                }),
            );

            // Wait for all messages to be processed and get results
            const results = await Promise.all(processingPromises);

            // Log processing results
            const successCount = results.filter(
              (result) => result.success,
            ).length;
            const failureCount = results.length - successCount;

            this.loggerService.info({
              ...loggerData,
              message: `Batch processing completed. Success: ${successCount}, Failed: ${failureCount}`,
            });

            // Perform batch delete for successful messages
            if (successfulMessages.length > 0) {
              try {
                const deleteResult =
                  await this.awsSqsService.deleteMessageBatch(
                    queueUrl,
                    successfulMessages,
                  );

                // Handle any failed deletions
                if (deleteResult.Failed && deleteResult.Failed.length > 0) {
                  this.loggerService.alert({
                    ...loggerData,
                    message: `Failed to delete some messages: ${JSON.stringify(deleteResult.Failed)}`,
                  });
                }
              } catch (batchDeleteError) {
                this.loggerService.error(
                  {
                    ...loggerData,
                    message: 'Error in batch delete operation',
                  },
                  { error: batchDeleteError },
                );
              }
            }
          } else {
            // If no messages, wait for a short time before polling again
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          this.loggerService.error(
            { ...loggerData, message: 'Error in message batch processing' },
            { error },
          );
          // Wait before retrying on error
          await new Promise((resolve) =>
            setTimeout(resolve, this.RETRY_DELAY_MS),
          );
        }
      }
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: 'Error processing file processing queue' },
        { error },
      );
    }
  }

  public async contentQueue() {
    const loggerData: ILoggerData = {
      serviceName: 'QueueReceiverService',
      function: 'contentQueue',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const queueNames = this.configurationService.getAwsQueueNames();
      const queueUrl = await this.awsSqsService.getQueue(
        queueNames.CrawlContentQueue,
      );

      if (!queueUrl) {
        throw new InternalServer('Queue is not configured');
      }

      // Process messages endlessly
      while (true) {
        try {
          // Receive up to 10 messages
          const response = await this.awsSqsService.receiveMessage(queueUrl);

          if (response.Messages && response.Messages.length > 0) {
            // Track successful and failed messages
            const successfulMessages: {
              Id: string | undefined;
              ReceiptHandle: string;
            }[] = [];

            const messageProcessingPromises = response.Messages.map(
              async (message) =>
                // Wrap runContext in a new Promise that we can resolve/reject

                new Promise<{
                  success: boolean;
                  messageId: string | undefined;
                  error?: Error;
                }>((resolve) => {
                  this.alsService.runContext(new Map(), async () => {
                    if (!message.ReceiptHandle) {
                      this.loggerService.error({
                        ...loggerData,
                        message: `Invalid message received - missing ReceiptHandle: ${message.MessageId}`,
                      });

                      resolve({
                        success: false,
                        messageId: message.MessageId,
                        error: new Error(
                          'Invalid message received - missing ReceiptHandle',
                        ),
                      });

                      return;
                    }

                    if (!message.Body) {
                      this.loggerService.error({
                        ...loggerData,
                        message: `Invalid message received - missing Body: ${message.MessageId}`,
                      });

                      // Invalid messages should be removed from queue
                      successfulMessages.push({
                        Id: message.MessageId,
                        ReceiptHandle: message.ReceiptHandle,
                      });

                      resolve({
                        success: false,
                        messageId: message.MessageId,
                        error: new Error(
                          'Invalid message received - missing Body',
                        ),
                      });

                      return;
                    }

                    try {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      const messageBody: CrawlContentQueuePayload = JSON.parse(
                        message.Body,
                      );

                      // Set tracing ID for the current context
                      this.alsService.setTraceId(messageBody.tracingId);

                      const receiveCount = parseInt(
                        message.MessageAttributes?.ApproximateReceiveCount
                          .StringValue || '0',
                      );

                      if (receiveCount >= this.MAX_RETRIES) {
                        // Message has exceeded retry limit, log and delete it
                        this.loggerService.warn({
                          ...loggerData,
                          message: `Message ${message.MessageId} exceeded retry limit (${this.MAX_RETRIES}). Deleting from queue.`,
                          additionalArgs: {
                            crawlingUrlId: messageBody.crawlingUrlId,
                            knowledgebaseId: messageBody.knowledgebaseId,
                          },
                        });

                        successfulMessages.push({
                          Id: message.MessageId,
                          ReceiptHandle: message.ReceiptHandle,
                        });

                        resolve({
                          success: false,
                          messageId: message.MessageId,
                          error: new Error('Max retries exceeded'),
                        });

                        return;
                      }

                      // Process the message
                      const crawledRes = await this.crawlerService
                        .crawlContent(messageBody)
                        .catch(() => null);

                      if (!crawledRes) {
                        await this.crawledUrlRepo.update(
                          {
                            _id: new mongoose.Types.ObjectId(
                              messageBody.crawlingUrlId,
                            ),
                          },
                          {
                            status: CrawledUrlStatus.FAILED,
                          },
                        );
                      } else {
                        const webPage: ProcessWebpage = {
                          url: messageBody.url,
                          bucketName: messageBody.bucketName,
                          storageBucketName: crawledRes.storageBucket,
                          storagePath: crawledRes.key,
                          knowledgebaseId: messageBody.knowledgebaseId,
                          crawlingSessionId: messageBody.crawlingSessionId,
                          crawlUrlId: messageBody.crawlingUrlId,
                          tracingId: this.alsService.getTraceId(),
                        };

                        await this.crawledUrlRepo.update(
                          {
                            _id: new mongoose.Types.ObjectId(
                              messageBody.crawlingUrlId,
                            ),
                          },
                          {
                            status: CrawledUrlStatus.SUCCESS,
                          },
                        );
                        this.triggerService.emitEvent(
                          EFileProcessorEvents.PROCESS_INCOMING_WEBPAGE,
                          webPage,
                        );
                      }

                      // If processing successful, delete the message
                      successfulMessages.push({
                        Id: message.MessageId,
                        ReceiptHandle: message.ReceiptHandle,
                      });

                      this.loggerService.debug({
                        ...loggerData,
                        message: `Successfully processed message: ${message.MessageId}`,
                        additionalArgs: {
                          crawlingUrlId: messageBody.crawlingUrlId,
                          knowledgebaseId: messageBody.knowledgebaseId,
                        },
                      });

                      resolve({ success: true, messageId: message.MessageId });
                    } catch (error) {
                      this.loggerService.error(
                        {
                          ...loggerData,
                          message: `Error processing message: ${message.MessageId}`,
                        },
                        { error },
                      );

                      // Handle retry logic
                      try {
                        // Change visibility timeout to 0 to make message immediately available again
                        await this.awsSqsService.changeMessageVisibility(
                          queueUrl,
                          message.ReceiptHandle,
                          0,
                        );

                        this.loggerService.info({
                          ...loggerData,
                          message: `Message ${message.MessageId} returned to queue for retry. Current retry count: ${message.Attributes?.ApproximateReceiveCount}`,
                        });
                      } catch (visibilityError) {
                        this.loggerService.error(
                          {
                            ...loggerData,
                            message: `Error returning message to queue: ${message.MessageId}`,
                          },
                          { error: visibilityError },
                        );

                        resolve({
                          success: false,
                          messageId: message.MessageId,
                          error: error as Error,
                        });
                      }
                    }
                  });
                }),
            );

            // Process messages concurrently using Promise.all
            const resolvePromiseResult = await Promise.all(
              messageProcessingPromises,
            );

            // Log processing results
            const successCount = resolvePromiseResult.filter(
              (result) => result.success,
            ).length;
            const failureCount = resolvePromiseResult.length - successCount;

            this.loggerService.notice({
              ...loggerData,
              message: `Batch processing completed. Success: ${successCount}, Failed: ${failureCount}`,
              additionalArgs: {
                failedMessageIds: resolvePromiseResult
                  .filter((result) => !result.success)
                  .map((result) => ({
                    messageId: result.messageId,
                    message: result.error?.message,
                  })),
              },
            });

            // Perform batch delete for successful messages
            if (successfulMessages.length > 0) {
              try {
                const deleteResult =
                  await this.awsSqsService.deleteMessageBatch(
                    queueUrl,
                    successfulMessages,
                  );

                // Handle any failed deletions
                if (deleteResult.Failed && deleteResult.Failed.length > 0) {
                  this.loggerService.error({
                    ...loggerData,
                    message: `Failed to delete some messages`,
                    additionalArgs: {
                      failedDeletions: deleteResult.Failed,
                    },
                  });
                }
              } catch (batchDeleteError) {
                this.loggerService.error(
                  {
                    ...loggerData,
                    message: 'Error in batch delete operation',
                  },
                  { error: batchDeleteError },
                );
              }
            }
          } else {
            // If no messages, wait for a short time before polling again
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          this.loggerService.error(
            { ...loggerData, message: 'Error in message batch processing' },
            { error },
          );
          // Wait before retrying on error
          await new Promise((resolve) =>
            setTimeout(resolve, this.RETRY_DELAY_MS),
          );
        }
      }
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: 'Error processing file content queue' },
        { error },
      );
    }
  }
}
