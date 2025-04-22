import { Index, PineconeRecord } from '@pinecone-database/pinecone';
import InternalServer from 'src/core/error/internal-server.error';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';
import { VectorDocument, VectorFilter } from './types/pinecone.type';
import { unflattenObject } from 'src/utils/helper';
import { VoyageEmbeddingsService } from 'src/lib/embeddings/voyage-embeddings/voyage-embeddings.service';

export class PineconeNsService {
  private namespace: Index;

  constructor(
    namespace: Index,
    private readonly embeddingService: VoyageEmbeddingsService,
    private readonly loggerService: LoggingService,
  ) {
    this.namespace = namespace;
  }

  public async addDocuments(documents: VectorDocument[]) {
    const loggerData: ILoggerData = {
      serviceName: 'PineconNameSpaceService',
      function: 'addDocuments',
      message: 'executing',
    };

    try {
      this.loggerService.info({
        ...loggerData,
        message: 'adding documents to pinecone',
      });

      const texts: string[] = documents.map((doc) => doc.text);
      const generatedEmbeddingBatch =
        await this.embeddingService.generateEmbeddingsBatch(texts, {
          input_type: 'document',
        });

      const batch = documents.map((doc, index) => {
        const data: PineconeRecord = {
          id: doc.id,
          values: generatedEmbeddingBatch[index],
          metadata: {
            text: doc.text,
            ...doc.metadata,
          },
        };

        return data;
      });

      await this.namespace.upsert(batch);

      this.loggerService.info({
        ...loggerData,
        message: 'documents added to pinecone',
      });
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: 'failed to add documents to pinecone' },
        { error: error as Error },
      );

      throw new InternalServer(
        'something went wrong while adding documents to pinecone',
      );
    }
  }

  public async query<T>(query: string, filter?: object): Promise<T> {
    const loggerData: ILoggerData = {
      serviceName: 'PineconNameSpaceService',
      function: 'query',
      message: 'executing',
    };

    try {
      this.loggerService.info({ ...loggerData, message: 'querying pinecone' });

      const queryEmbedding = await this.embeddingService.generateEmbeddings(
        query,
        { input_type: 'query' },
      );

      const matchedDocuments = await this.namespace.query({
        vector: queryEmbedding,
        topK: 3,
        includeMetadata: true,
        filter,
      });

      const formattedDocuments = matchedDocuments.matches.map((match) =>
        unflattenObject(match),
      );

      this.loggerService.info({
        ...loggerData,
        message: 'query executed successfully',
      });

      return formattedDocuments as T;
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: 'failed to query pinecone' },
        { error: error as Error },
      );

      throw new InternalServer('something went wrong while query pinecone');
    }
  }

  public async deleteDocuments(filter: VectorFilter): Promise<void> {
    const loggerData: ILoggerData = {
      serviceName: 'PineconNameSpaceService',
      function: 'deleteDocuments',
      message: 'executing',
    };

    try {
      this.loggerService.info({
        ...loggerData,
        message: 'deleting documents from pinecone',
      });

      const vectorList = await this.namespace.listPaginated({
        prefix: filter.prefix,
      });

      let vectorIds: string[] = [];

      if (vectorList.vectors && vectorList.vectors.length) {
        vectorIds = vectorList.vectors
          .map((vector) => vector.id)
          .filter((vectorId) => vectorId !== undefined);

        await this.namespace.deleteMany(vectorIds);
      }

      this.loggerService.info({
        ...loggerData,
        message: 'documents deleted from pinecone',
      });
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: 'failed to delete documents from pinecone' },
        { error: error as Error },
      );

      throw new InternalServer(
        'something went wrong while deleting documents from pinecone',
      );
    }
  }
}
