import { Document } from "@langchain/core/documents";

export interface IBaseTextSplitter {
  splitDocuments(document: Document[]): Promise<Document[]>;
}

export interface IRecursiveTextSplitterParams {
  chunkSize: number;
  chunkOverlap: number;
  separators: string[];
}