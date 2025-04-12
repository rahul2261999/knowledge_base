import { PineconeNsService } from './pinecone/pinecone-ns.service';

export interface BaseGetRetriver {
  retrivalLimit: number;
  tenantId: string;
  filter?: Record<string, string> | object;
}

export interface AddDocumentOptions {
  tenantId: string;
}

export interface BaseVectorStore {
  getNamespace(namespaceId: string): Promise<PineconeNsService>;
}
