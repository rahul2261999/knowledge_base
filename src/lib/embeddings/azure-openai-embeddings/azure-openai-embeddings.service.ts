import { AzureOpenAIEmbeddings } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import InternalServer from 'src/core/error/internal-server.error';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';

@Injectable()
export class AzureOpenaiEmbeddingsService {
  private model: AzureOpenAIEmbeddings;

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly loggerService: LoggingService,
  ) {
    const azureOpenAiCreds = this.configurationService.getAzureOpenAiCreds();

    this.model = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: azureOpenAiCreds.apiKey,
      azureOpenAIApiInstanceName: azureOpenAiCreds.apiInstanceName,
      azureOpenAIApiEmbeddingsDeploymentName:
        azureOpenAiCreds.apiEmbeddingsDeploymentName,
      azureOpenAIApiVersion: azureOpenAiCreds.apiVersion,
    });
  }

  public getEmbeddingModel() {
    return this.model;
  }

  public async generateEmbeddings(text: string) {
    const loggerData: ILoggerData = {
      serviceName: 'AzureOpenaiEmbeddingsService',
      function: 'generateEmbeddings',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const embedding = await this.model.embedQuery(text);

      this.loggerService.info({
        ...loggerData,
        message: 'embeddings generated',
      });

      return embedding;
    } catch (error) {
      this.loggerService.error(
        {
          ...loggerData,
          message: 'failed to generate embeddings',
        },
        { error: error as Error },
      );

      throw new InternalServer('Error generating embeddings');
    }
  }
}
