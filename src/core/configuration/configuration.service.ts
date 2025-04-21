import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AzureServiceBusCredentials {
  connectionString: string;
}

@Injectable()
export class ConfigurationService {
  constructor(private readonly configService: ConfigService) {}

  getMongoUri() {
    const uri = this.configService.get<string>('MONGODB_ATLAS_URI');
    if (!uri) {
      throw new InternalServerErrorException(
        'MongoDB URI not found in environment variables',
      );
    }

    return uri;
  }

  getAwsS3Buckets() {
    const buckets = this.configService.get<{
      knowledgebase: string;
      crawler: string;
    }>('Aws.AwsS3.buckets');

    if (!buckets) {
      throw new InternalServerErrorException(
        'buckets not found in configruation',
      );
    }

    return buckets;
  }

  getAwsS3Creds() {
    const accessKey: string = this.configService.get('AWS_ACCESS_KEY_ID')!;
    const secretAccessKey: string = this.configService.get(
      'AWS_SECRET_ACCESS_KEY',
    )!;

    return { accessKey, secretAccessKey };
  }

  getPineconeIndex() {
    const indexName = this.configService.get<string>('PINECONE_INDEX_NAME')!;
    const indexHost = this.configService.get<string>('PINECONE_INDEX_HOST')!;

    return { indexName, indexHost };
  }

  getAzureOpenAiCreds() {
    const apiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY')!;
    const apiInstanceName = this.configService.get<string>(
      'AZURE_OPENAI_API_INSTANCE_NAME',
    )!;
    const apiEmbeddingsDeploymentName = this.configService.get<string>(
      'AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME',
    )!;
    const apiVersion = this.configService.get<string>(
      'AZURE_OPENAI_API_VERSION',
    )!;

    return { apiKey, apiInstanceName, apiEmbeddingsDeploymentName, apiVersion };
  }

  getAwsQueueNames() {
    const queues = this.configService.get<{
      FileProcessingQueue: string;
      CrawlContentQueue: string;
    }>('Aws.AwsSqs.Queues')!;

    return queues;
  }

  getVoyageCreds() {
    const apiKey = this.configService.get<string>('VOYAGE_API_KEY')!;
    const model = this.configService.get<string>('VOYAGE_MODEL')!;

    return { apiKey, model };
  }

  public getAzureServiceBusCreds(): AzureServiceBusCredentials {
    const connectionString = this.configService.get<string>(
      'AZURE_SERVICE_BUS_CONNECTION_STRING',
    )!;

    return { connectionString };
  }

  public getAzureStorageCreds() {
    const connectionString = this.configService.get<string>(
      'AZURE_STORAGE_ACCOUNT_ACCESS_KEY',
    )!;

    return { connectionString };
  }

  public getAzureQueueNames() {
    const queues = this.configService.get<{
      FileProcessingQueue: string;
      CrawlContentQueue: string;
    }>('Azure.ServiceBus.Queues')!;

    return queues;
  }

  public getAzureStorageContainer() {
    const buckets = this.configService.get<{
      knowledgebase: string;
      crawler: string;
    }>('Azure.S3.buckets')!;

    return buckets;
  }
}
