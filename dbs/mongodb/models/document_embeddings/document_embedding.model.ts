import { model, Schema } from "mongoose";
import { IDocumentEmbedding } from "./document_embedding.type";

const documentEmbeddingSchema = new Schema<IDocumentEmbedding>({
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
  source: { type: String, required: true },
  pdf: { type: Object, required: true },
  loc: { type: Object, required: true },
  tenantId: { type: String, required: true },
  documentId: { type: String, required: true },
});


const docuemntEmbedding = model('document_embeddings', documentEmbeddingSchema);

export default docuemntEmbedding;