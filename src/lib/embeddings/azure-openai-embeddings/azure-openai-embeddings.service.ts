import { AzureOpenAIEmbeddings } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import InternalServer from 'src/core/error/internal-server.error';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';
import { BaseEmbeddingMethods } from '../index.type';
import {
  AzureOpenAIEmbeddingOptions,
  AzureOpenAIModel,
} from './azure-openai.type';

@Injectable()
export class AzureOpenaiEmbeddingsService
  implements BaseEmbeddingMethods<AzureOpenAIModel, AzureOpenAIEmbeddingOptions>
{
  private model: AzureOpenAIEmbeddings;
  private modelConfig: AzureOpenAIModel;

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly loggerService: LoggingService,
  ) {
    const azureOpenAiCreds = this.configurationService.getAzureOpenAiCreds();

    this.modelConfig = {
      apiKey: azureOpenAiCreds.apiKey,
      model: azureOpenAiCreds.apiEmbeddingsDeploymentName,
      azureOpenAIApiKey: azureOpenAiCreds.apiKey,
      azureOpenAIApiInstanceName: azureOpenAiCreds.apiInstanceName,
      azureOpenAIApiEmbeddingsDeploymentName:
        azureOpenAiCreds.apiEmbeddingsDeploymentName,
      azureOpenAIApiVersion: azureOpenAiCreds.apiVersion,
    };

    this.model = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: this.modelConfig.azureOpenAIApiKey,
      azureOpenAIApiInstanceName: this.modelConfig.azureOpenAIApiInstanceName,
      azureOpenAIApiEmbeddingsDeploymentName:
        this.modelConfig.azureOpenAIApiEmbeddingsDeploymentName,
      azureOpenAIApiVersion: this.modelConfig.azureOpenAIApiVersion,
    });
  }

  public getEmbeddingModel() {
    return this.modelConfig;
  }

  public async generateEmbeddings(
    text: string,
    _options?: AzureOpenAIEmbeddingOptions,
  ) {
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

  public async generateEmbeddingsBatch(
    texts: string[],
    _options?: AzureOpenAIEmbeddingOptions,
  ) {
    const loggerData: ILoggerData = {
      serviceName: 'AzureOpenaiEmbeddingsService',
      function: 'generateEmbeddingsBatch',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const embedding = await this.model.embedDocuments(texts);

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
