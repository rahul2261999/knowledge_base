import { BaseVectorStore } from '../base.interface';
import { Index, Pinecone } from '@pinecone-database/pinecone';
import InternalServer from 'src/core/error/internal-server.error';
import { Injectable } from '@nestjs/common';
import { ILoggerData } from 'src/lib/logger/logger.type';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import { PineconeNsService } from './pinecone-ns.service';
import { VoyageEmbeddingsService } from 'src/lib/embeddings/voyage-embeddings/voyage-embeddings.service';

@Injectable()
export class PineconeVectorStoreService implements BaseVectorStore {
  private pineconeClient: Pinecone;
  private index: Index;

  constructor(
    private readonly loggingService: LoggingService,
    private readonly configurationService: ConfigurationService,
    private readonly embeddingService: VoyageEmbeddingsService,
  ) {
    this.pineconeClient = new Pinecone();

    const pineconeIndexConfig = this.configurationService.getPineconeIndex();
    this.index = this.pineconeClient.index(
      pineconeIndexConfig.indexName,
      pineconeIndexConfig.indexHost,
    );
  }

  public getNamespace(namespaceId: string) {
    const loggerData: ILoggerData = {
      serviceName: 'PineconeVectorStoreService',
      function: 'getNamespace',
    };
    try {
      this.loggingService.info({ ...loggerData, message: 'executing' });

      this.loggingService.info({ ...loggerData, message: 'executed' });

      return new PineconeNsService(
        this.index.namespace(namespaceId),
        this.embeddingService,
        this.loggingService,
      );
    } catch (error) {
      this.loggingService.error(
        { ...loggerData, message: 'failed to execute' },
        { error: error as Error },
      );

      throw new InternalServer('Something went wrong', { error: [error] });
    }
  }
}
