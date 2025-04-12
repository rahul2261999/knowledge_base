import {
  Injectable,
  InternalServerErrorException,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  getS3Buckets() {
    const buckets = this.configService.get<{ knowledgebase: string }>(
      'AwsS3.buckets',
    );

    if (!buckets) {
      throw new InternalServerErrorException(
        'buckets not found in configruation',
      );
    }

    return buckets;
  }

  getS3Creds() {
    const accessKey = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

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

  getQueueNames() {
    const queues = this.configService.get<{ FileProcessingQueue: string }>(
      'AwsSqs.Queues',
    )!;

    return queues;
  }
}
