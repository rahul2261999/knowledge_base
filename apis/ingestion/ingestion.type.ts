import { ILoggerData } from "../../utils/logger/logger.type";
import * as multer from 'multer'

export interface IIngestionMethods {
  uploadTrainingData(params: IUploadTrainingData): Promise<{ documentId: string }>;
  bulkUploadTrainingData(params: IBulkUploadTrainingData, options: IIngestionMethodsOptions): Promise<void>;
  // triggerTraining(): Promise<void>;
  // trainingCallback(): Promise<void>;
  deleteTrainingData(params: IDeleteTraininData): Promise<void>;
}

export interface IIngestionMethodsOptions {
  loggerData: ILoggerData
}

export interface ITrainingMetaData {
  tenantId: string;
  [key: string]: string | number | boolean;
}

export interface IUploadTrainingData {
  file: Express.Multer.File;
  metaData: ITrainingMetaData;
}

export interface IBulkUploadTrainingData {
  files: Express.Multer.File[];
  metaData: ITrainingMetaData;
}

export interface IDeleteTraininData {
  tenantId: string;
  documentId: string;
  [key: string]: string | number | boolean | null
}
