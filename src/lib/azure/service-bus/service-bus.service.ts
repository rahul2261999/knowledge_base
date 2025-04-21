import { Injectable } from '@nestjs/common';
import {
  ServiceBusClient,
  ServiceBusMessage,
  ServiceBusReceiver,
} from '@azure/service-bus';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';
import InternalServer from 'src/core/error/internal-server.error';
import { ServiceBusMessageOptions, BatchResult } from './service-bus.type';

@Injectable()
export class ServiceBusService {
  private serviceBusClient: ServiceBusClient;

  constructor(
    private readonly loggerService: LoggingService,
    private readonly configurationService: ConfigurationService,
  ) {
    const connectionString =
      this.configurationService.getAzureServiceBusCreds()?.connectionString;

    if (!connectionString) {
      const error = new Error(
        'Azure Service Bus connection string is not configured',
      );

      this.loggerService.error(
        {
          serviceName: 'ServiceBusService',
          function: 'constructor',
          message: 'failed',
        },
        { error },
      );

      throw error;
    }

    this.serviceBusClient = new ServiceBusClient(connectionString);
  }

  public async sendMessage(queueName: string, message: ServiceBusMessage) {
    const loggerData: ILoggerData = {
      serviceName: 'ServiceBusService',
      function: 'sendMessage',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const sender = this.serviceBusClient.createSender(queueName);

      await sender.sendMessages(message);
      await sender.close();

      this.loggerService.info({ ...loggerData, message: 'executed' });
      return { sent: true };
    } catch (error: unknown) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });
      return new InternalServer('Something went wrong while sending message');
    }
  }

  public async sendMessageBatch(
    queueName: string,
    messages: ServiceBusMessageOptions[],
    options?: { batchSize?: number },
  ) {
    const loggerData: ILoggerData = {
      serviceName: 'ServiceBusService',
      function: 'sendMessageBatch',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const sender = this.serviceBusClient.createSender(queueName);
      const batchSize = options?.batchSize || 100;
      const results: BatchResult[] = [];

      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        const serviceBusMessages = batch.map((message) => ({
          body: message.body,
          applicationProperties: message.applicationProperties,
        }));

        await sender.sendMessages(serviceBusMessages);
        results.push({ successful: serviceBusMessages.length });

        this.loggerService.debug({
          ...loggerData,
          message: `Batch sent to queue, successful: ${serviceBusMessages.length}`,
        });
      }

      await sender.close();
      this.loggerService.info({ ...loggerData, message: 'executed' });

      return { sent: true, data: results };
    } catch (error: unknown) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });
      return new InternalServer(
        'Something went wrong while sending message batch',
      );
    }
  }

  public createReceiver(queueName: string): ServiceBusReceiver {
    const loggerData: ILoggerData = {
      serviceName: 'ServiceBusService',
      function: 'createReceiver',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const receiver = this.serviceBusClient.createReceiver(queueName);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return receiver;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });
      throw new InternalServer('Failed to create queue receiver');
    }
  }
}
