import { IngestionStatus, S3Document } from "./document.type";
import { model, Schema } from "mongoose";

const docuemntSchema = new Schema<S3Document>({
  tenantId: {
    type: String,
    required: true
  },
  nameWithExtension: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(IngestionStatus),
    default: IngestionStatus.PENDING
  },
  url: {
    type: String,
    required: true
  },
  createdBy: {
    type: Number,
  },
  updatedBy: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
})

const S3Document = model('s3_documents', docuemntSchema);

export default S3Document;