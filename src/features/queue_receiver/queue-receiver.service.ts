import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AlsService } from 'src/core/common/als/als.service';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import InternalServer from 'src/core/error/internal-server.error';
import { AwsSqsService } from 'src/lib/aws_sqs/aws-sqs.service';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';
import { FileProcessorEvents } from '../events/ingestion/file-processor.event';
import { IProcessIncomingFileAttrs } from 'src/lib/file_processors/index.type';

@Injectable()
export class QueueReceiverService implements OnApplicationBootstrap {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 5000;

  constructor(
    private readonly loggerService: LoggingService,
    private readonly awsSqsService: AwsSqsService,
    private readonly configurationService: ConfigurationService,
    private readonly alsService: AlsService,
    private readonly fileProcessorEvents: FileProcessorEvents,
  ) {}
  
  // This method will be called once the application is ready
  async onApplicationBootstrap() {
    this.loggerService.info({
      serviceName: 'QueueReceiverService',
      function: 'onApplicationBootstrap',
      message: 'Starting queue receiver service'
    });

    // Start the queue processing in the background
    this.startQueueProcessing().catch(error => {
      this.loggerService.error({
        serviceName: 'QueueReceiverService',
        function: 'onApplicationBootstrap',
        message: 'Failed to start queue processing'
      }, { error });
    });
  }

  private async startQueueProcessing() {
    while (true) {
      try {
        await this.fileProcessingQueue();
      } catch (error) {
        this.loggerService.error({
          serviceName: 'QueueReceiverService',
          function: 'startQueueProcessing',
          message: 'Queue processing failed, restarting...'
        }, { error });

        // Wait before restarting to prevent rapid restart loops
        await new Promise(resolve => setTimeout(resolve, 5000));
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

      const queueNames = this.configurationService.getQueueNames();
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
            await Promise.all(
              response.Messages.map(async (message) => {
                this.alsService.runContext(new Map(), async () => {
                  if (!message.Body) {
                    this.loggerService.error({
                      ...loggerData,
                      message: `Invalid message received - missing Body: ${message.MessageId}`,
                    });

                    return;
                  }

                  if (!message.ReceiptHandle) {
                    this.loggerService.error({
                      ...loggerData,
                      message: `Invalid message received - missing ReceiptHandle: ${message.MessageId}`,
                    });

                    return;
                  }

                  try {
                    const messageBody: IProcessIncomingFileAttrs = JSON.parse(
                      message.Body,
                    );

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
                      });

                      await this.awsSqsService.deleteMessage(
                        queueUrl,
                        message.ReceiptHandle,
                      );

                      return;
                    }

                    // Process the message

                    await this.fileProcessorEvents.processFile(messageBody);

                    // If processing successful, delete the message
                    await this.awsSqsService.deleteMessage(
                      queueUrl,
                      message.ReceiptHandle,
                    );

                    this.loggerService.debug({
                      ...loggerData,
                      message: `Successfully processed message: ${message.MessageId}`,
                    });
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
                    }
                  }
                });
              }),
            );
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
}
