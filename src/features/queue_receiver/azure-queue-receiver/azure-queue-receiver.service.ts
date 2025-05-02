import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AlsService } from 'src/core/common/als/als.service';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';
import mongoose from 'mongoose';
import { CrawledUrlStatus } from 'src/core/constants/global.enum';
import { CrawlerService } from '../../crawler/crawler.service';
import { CrawledUrlRepo } from '../../crawler/repo/crawled-url.repo';
import { ProcessWebpage } from '../../events/events.type';
import { TriggerService } from '../../events/trigger/triggers.service';
import { EFileProcessorEvents } from '../../events/events.enum';
import { ServiceBusService } from 'src/lib/azure/service-bus/service-bus.service';
import {
  delay,
  ProcessErrorArgs,
  ServiceBusReceiver,
  ServiceBusReceivedMessage,
  SubscribeOptions,
} from '@azure/service-bus';
import {
  CrawlContentQueuePayload,
  ProcessIncomingFileAttrs,
} from 'src/lib/azure/service-bus/service-bus.interface';
import { MessageHandlers } from 'src/lib/azure/service-bus/service-bus.type';
import { BackoffStrategy } from 'src/core/common/backoff/backoff.strategy';

@Injectable()
export class AzureQueueReceiverService implements OnApplicationBootstrap {
  private readonly RETRY_DELAY_MS = 5000;
  private readonly RECEIVER_OPTIONS: SubscribeOptions = {
    maxConcurrentCalls: 10,
    autoCompleteMessages: false,
  };

  private readonly contentQueueBackoff: BackoffStrategy;

  constructor(
    private readonly loggerService: LoggingService,
    private readonly configurationService: ConfigurationService,
    private readonly alsService: AlsService,
    private readonly crawlerService: CrawlerService,
    private readonly triggerService: TriggerService,
    private readonly crawledUrlRepo: CrawledUrlRepo,
    private readonly serviceBusService: ServiceBusService,
  ) {
    this.contentQueueBackoff = new BackoffStrategy(this.loggerService);
  }

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
    await this.contentQueueBackoff.execute(
      async () => {
        await this.azureContentQueue();
      },
      {
        serviceName: 'QueueReceiverService',
        functionName: 'startQueueProcessing',
      },
    );
  }

  private async handleProcessError(
    receiver: ServiceBusReceiver,
    loggerData: ILoggerData,
    args: ProcessErrorArgs,
  ): Promise<void> {
    this.loggerService.error(
      {
        ...loggerData,
        message: 'Error processing message',
        additionalArgs: {
          errorSource: args.errorSource,
          fullyQualifiedNamespace: args.fullyQualifiedNamespace,
        },
      },
      { error: args.error },
    );
    await receiver.close();
  }

  private async handleDeadLetter(
    receiver: ServiceBusReceiver,
    message: ServiceBusReceivedMessage,
    reason: string,
    description: string,
  ): Promise<void> {
    await receiver.deadLetterMessage(message, {
      deadLetterReason: reason,
      deadLetterErrorDescription: description,
    });
  }

  private async processFileMessage(
    message: ServiceBusReceivedMessage,
    receiver: ServiceBusReceiver,
    loggerData: ILoggerData,
  ): Promise<void> {
    try {
      if (!message.body) {
        this.loggerService.error({
          ...loggerData,
          message: `Invalid message received`,
        });

        await receiver.abandonMessage(message);

        return;
      }

      const messageBody = message.body as ProcessIncomingFileAttrs;
      this.alsService.setTraceId(messageBody.tracingId);

      this.loggerService.notice({
        ...loggerData,
        message: `Processing file message`,
        additionalArgs: {
          payload: JSON.stringify(messageBody),
        },
      });

      // Process the message
      // await this.fileProcessorEvents.processFile(messageBody);

      this.loggerService.debug({
        ...loggerData,
        message: `Successfully processed message`,
      });

      await receiver.completeMessage(message);
    } catch (error) {
      this.loggerService.error(
        {
          ...loggerData,
          message: `Error processing message`,
        },
        { error },
      );

      // Let Azure handle the retry by abandoning the message
      await receiver.abandonMessage(message);
    }
  }

  private async processContentMessage(
    message: ServiceBusReceivedMessage,
    receiver: ServiceBusReceiver,
    loggerData: ILoggerData,
  ): Promise<void> {
    try {
      if (!message.body) {
        this.loggerService.error({
          ...loggerData,
          message: `Invalid message received`,
        });

        await receiver.abandonMessage(message);

        return;
      }

      const messageBody = message.body as CrawlContentQueuePayload;
      this.alsService.setTraceId(messageBody.tracingId);

      this.loggerService.notice({
        ...loggerData,
        message: `Processing content message`,
        additionalArgs: {
          payload: JSON.stringify(messageBody),
        },
      });

      // Process the message
      const crawledRes = await this.crawlerService
        .crawlContent(messageBody)
        .catch(() => null);

      if (!crawledRes) {
        await this.crawledUrlRepo.update(
          {
            _id: new mongoose.Types.ObjectId(messageBody.crawlingUrlId),
          },
          {
            status: CrawledUrlStatus.FAILED,
          },
        );
        await this.handleDeadLetter(
          receiver,
          message,
          'Crawl Failed',
          `Failed to crawl content for URL: ${messageBody.url}`,
        );
        return;
      }

      const webPage: ProcessWebpage = {
        url: messageBody.url,
        tag: messageBody.tag,
        storageBucketName: crawledRes.storageBucket,
        storagePath: crawledRes.key,
        knowledgebaseId: messageBody.knowledgebaseId,
        crawlingSessionId: messageBody.crawlingSessionId,
        crawlUrlId: messageBody.crawlingUrlId,
        tracingId: this.alsService.getTraceId(),
      };

      await this.crawledUrlRepo.update(
        {
          _id: new mongoose.Types.ObjectId(messageBody.crawlingUrlId),
        },
        {
          status: CrawledUrlStatus.SUCCESS,
        },
      );

      this.triggerService.emitEvent(
        EFileProcessorEvents.PROCESS_INCOMING_WEBPAGE,
        webPage,
      );

      this.loggerService.debug({
        ...loggerData,
        message: `Successfully processed message`,
        additionalArgs: {
          crawlingUrlId: messageBody.crawlingUrlId,
          knowledgebaseId: messageBody.knowledgebaseId,
        },
      });

      await receiver.completeMessage(message);
    } catch (error) {
      this.loggerService.error(
        {
          ...loggerData,
          message: `Error processing message`,
        },
        { error },
      );

      // Let Azure handle the retry by abandoning the message
      await receiver.abandonMessage(message);
    }
  }

  public async azureFileProcessingQueue() {
    const loggerData: ILoggerData = {
      serviceName: 'QueueReceiverService',
      function: 'azureFileProcessingQueue',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const queueNames = this.configurationService.getAwsQueueNames();
      const receiver = this.serviceBusService.createReceiver(
        queueNames.FileProcessingQueue,
      );

      const messageHandlers: MessageHandlers = {
        processMessage: async (message) => {
          await this.processFileMessage(message, receiver, loggerData);
        },
        processError: async (args) => {
          await this.handleProcessError(receiver, loggerData, args);
        },
      };

      // Process messages with concurrent processing limit
      receiver.subscribe(messageHandlers, this.RECEIVER_OPTIONS);

      // Keep the receiver running with efficient delay
      while (true) {
        await delay(this.RETRY_DELAY_MS);
      }
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: 'Error processing file processing queue' },
        { error },
      );
      throw error;
    }
  }

  public async azureContentQueue() {
    const loggerData: ILoggerData = {
      serviceName: 'QueueReceiverService',
      function: 'azureContentQueue',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const queueNames = this.configurationService.getAzureQueueNames();
      const receiver = this.serviceBusService.createReceiver(
        queueNames.CrawlContentQueue,
      );

      // Keep the receiver running with efficient delay
      await delay(this.RETRY_DELAY_MS);

      const messageHandlers: MessageHandlers = {
        processMessage: async (message) => {
          await this.processContentMessage(message, receiver, loggerData);
        },
        processError: async (args) => {
          await this.handleProcessError(receiver, loggerData, args);
        },
      };

      // Process messages with concurrent processing limit
      receiver.subscribe(messageHandlers, this.RECEIVER_OPTIONS);
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: 'Error processing content queue' },
        { error },
      );
      throw error;
    }
  }
}
