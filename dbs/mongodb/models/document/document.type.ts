export enum IngestionStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  DELETED = 'DELETED',
}

export interface BaseDocument {
  nameWithExtension: string;
  size: number;
  version: number;
  status: IngestionStatus
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number | null;
  updatedBy: number | null;
}

export interface S3Document extends BaseDocument {
  _id: string;
  url: string;
}

export interface CreateS3Document {
  url: string;
  nameWithExtension: string;
  size: number;
  version: number;
  status: IngestionStatus
  tenantId: string;
  createdBy: number | null;
  updatedBy: number | null;
}