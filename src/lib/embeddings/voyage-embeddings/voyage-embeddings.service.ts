import { Injectable } from '@nestjs/common';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';
import { BaseEmbeddingMethods } from '../index.type';
import InternalServer from 'src/core/error/internal-server.error';
import {
  VoyageEmbeddingOptions,
  VoyageEmbeddingResponse,
  VoyageModel,
} from './voyage.type';

@Injectable()
export class VoyageEmbeddingsService
  implements BaseEmbeddingMethods<VoyageModel, VoyageEmbeddingOptions>
{
  private modelConfig: VoyageModel;

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly loggerService: LoggingService,
  ) {
    const voyageCreds = this.configurationService.getVoyageCreds();
    this.modelConfig = {
      apiKey: voyageCreds.apiKey,
      model: voyageCreds.model,
    };
  }

  public getEmbeddingModel() {
    return this.modelConfig;
  }

  public async generateEmbeddings(
    text: string,
    options?: VoyageEmbeddingOptions,
  ): Promise<number[]> {
    const loggerData: ILoggerData = {
      serviceName: 'VoyageEmbeddingsService',
      function: 'generateEmbeddings',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const response = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.modelConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelConfig.model,
          input: text,
          input_type: options?.input_type ?? 'query',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = (await response.json()) as VoyageEmbeddingResponse;
      const embedding = result.data[0].embedding;

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
    options?: VoyageEmbeddingOptions,
  ): Promise<number[][]> {
    const loggerData: ILoggerData = {
      serviceName: 'VoyageEmbeddingsService',
      function: 'generateEmbeddingsBatch',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const response = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.modelConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelConfig.model,
          input: texts,
          input_type: options?.input_type ?? 'query',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = (await response.json()) as VoyageEmbeddingResponse;
      const embeddings = result.data.map((item) => item.embedding);

      this.loggerService.info({
        ...loggerData,
        message: 'embeddings generated',
      });

      return embeddings;
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
