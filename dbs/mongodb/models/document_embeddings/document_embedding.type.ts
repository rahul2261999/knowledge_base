import { Document } from "mongoose";

export interface IDocumentEmbedding extends Document{
  text: string;
  embedding: number[];
  source: string;
  pdf: Object;
  loc: Object;
  tenantId: string;
  documentId: string;
}