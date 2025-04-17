import {
  ChangeMessageVisibilityCommand,
  DeleteMessageCommand,
  GetQueueUrlCommand,
  MessageAttributeValue,
  MessageSystemAttributeValue,
  ReceiveMessageCommand,
  SendMessageBatchCommand,
  SendMessageBatchCommandOutput,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import InternalServer from 'src/core/error/internal-server.error';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';
import { SqsMessage } from './aws-sqs-interface';

@Injectable()
export class AwsSqsService {
  private sqsClient: SQSClient;

  constructor(
    private readonly loggerService: LoggingService,
    private readonly configurationService: ConfigurationService,
  ) {
    const creds = this.configurationService.getS3Creds();

    this.sqsClient = new SQSClient({
      credentials: {
        accessKeyId: creds.accessKey,
        secretAccessKey: creds.secretAccessKey,
      },
      region: 'us-east-1',
    });
  }

  public async getQueue(queueName: string) {
    const loggerData: ILoggerData = {
      serviceName: 'AwsSqsService',
      function: 'getQueue',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const command = new GetQueueUrlCommand({ QueueName: queueName });
      const response = await this.sqsClient.send(command);

      this.loggerService.debug({
        ...loggerData,
        message: `Queue exists: ${response.QueueUrl}`,
      });
      this.loggerService.info({ ...loggerData, message: 'executed' });

      return response.QueueUrl;
    } catch (error) {
      if (error.name === 'QueueDoesNotExist') {
        this.loggerService.debug({
          ...loggerData,
          message: 'Queue does not exist.',
        });

        return undefined;
      }

      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      return undefined;
    }
  }

  public async changeMessageVisibility(
    queueUrl: string,
    receiptHandle: string,
    visibilityTimeout: number,
  ) {
    const loggerData: ILoggerData = {
      serviceName: 'AwsSqsService',
      function: 'changeMessageVisibility',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const command = new ChangeMessageVisibilityCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
        VisibilityTimeout: visibilityTimeout,
      });

      await this.sqsClient.send(command);

      this.loggerService.info({ ...loggerData, message: 'executed' });
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer(
        'Something went wrong while changing message visibility',
      );
    }
  }

  public async sendMessage(
    queueUrl: string,
    message: {
      attributes?: Record<string, MessageAttributeValue>;
      body?: Record<string, any> | undefined;
    },
  ) {
    const loggerData: ILoggerData = {
      serviceName: 'AwsSqsService',
      function: 'sendMessage',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        DelaySeconds: 10,
        MessageAttributes: message.attributes,
        MessageBody: message.body ? JSON.stringify(message.body) : undefined,
      });

      const response = await this.sqsClient.send(command);

      this.loggerService.debug({
        ...loggerData,
        message: `message sent to queue, messageId: ${response.MessageId}`,
      });
      this.loggerService.info({ ...loggerData, message: 'executed' });

      return { sent: true, data: response };
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      return new InternalServer('Something went wrong while sending message');
    }
  }

  public async sendMessageInBatch(
    queueName: string,
    messages: SqsMessage[],
    options?: { batchSize?: number },
  ) {
    const loggerData: ILoggerData = {
      serviceName: 'AwsSqsService',
      function: 'sendMessage',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const queueUrl = await this.getQueue(queueName);

      if (!queueUrl) {
        return new InternalServer('Queue does not exist');
      }

      // AWS SQS has a limit of 10 messages per batch
      const batchSize =
        options &&
        options.batchSize &&
        options.batchSize >= 1 &&
        options.batchSize <= 10
          ? options.batchSize
          : 10;
      const results: SendMessageBatchCommandOutput[] = [];

      // Process messages in batches of 10
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);

        const entries = batch.map((message, index) => ({
          Id: `msg_${i}_${index}`,
          DelaySeconds: 10,
          MessageAttributes: message.attributes,
          MessageBody: message.body ? JSON.stringify(message.body) : undefined,
        }));

        const command = new SendMessageBatchCommand({
          QueueUrl: queueUrl,
          Entries: entries,
        });

        const response = await this.sqsClient.send(command);
        results.push(response);

        this.loggerService.debug({
          ...loggerData,
          message: `Batch sent to queue, successful: ${response.Successful?.length}, failed: ${response.Failed?.length}`,
        });
      }

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return { sent: true, data: results };
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      return new InternalServer('Something went wrong while sending message');
    }
  }

  public async receiveMessage(
    queueUrl: string,
    options?: { attributes?: string[] },
  ) {
    const loggerData: ILoggerData = {
      serviceName: 'AwsSqsService',
      function: 'receiveMessage',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const command = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MessageAttributeNames:
          options && options.attributes
            ? Object.keys(options.attributes)
            : undefined,
        MessageSystemAttributeNames: [
          'ApproximateReceiveCount',
          'AWSTraceHeader',
          'SequenceNumber',
        ],
        WaitTimeSeconds: 20,
      });

      const response = await this.sqsClient.send(command);

      this.loggerService.info({ ...loggerData, message: 'executed' });

      return response;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });

      throw new InternalServer(
        'Something went wrong while receving message from queue',
      );
    }
  }

  public async deleteMessage(queueUrl: string, receiptHandle: string) {
    const loggerData: ILoggerData = {
      serviceName: 'AwsSqsService',
      function: 'deleteMessage',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const command = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await this.sqsClient.send(command);

      this.loggerService.info({ ...loggerData, message: 'executed' });
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' }, { error });
      throw new InternalServer(
        'Something went wrong while deleting message from queue',
      );
    }
  }
}
