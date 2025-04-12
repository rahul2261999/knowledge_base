import { Document } from "@langchain/core/documents"
import { VectorStoreRetriever } from "@langchain/core/vectorstores"

export interface BaseGetRetriver {
  k?: number,
  filter?: Record<string, string> | object;
}

export interface BaseVectorStore {
  addDocuments(documents: Document[]): Promise<void>;

  getRetriver(params?: BaseGetRetriver): VectorStoreRetriever;
}