import { ILoggerData } from "../../utils/logger/logger.type";
import * as multer from 'multer'

export interface IIngestionMethods {
  uploadTrainingData(params: IUploadTrainingData, options: IIngestionMethodsOptions): Promise<void>;
  bulkUploadTrainingData(params: IBulkUploadTrainingData, options: IIngestionMethodsOptions): Promise<void>;
  // triggerTraining(): Promise<void>;
  // trainingCallback(): Promise<void>;
  deleteTrainingData(params: any, options: IIngestionMethodsOptions): Promise<void>;
}

export interface IIngestionMethodsOptions {
  loggerData: ILoggerData
}

export interface ITrainingMetaData {
  tenantId: string;
  [key: string]: string | number | boolean;
}

export interface IUploadTrainingData {
  file: File & { path: string };
  metaData: ITrainingMetaData;
}

export interface IBulkUploadTrainingData {
  file: File & { path: string }[];
  metaData: ITrainingMetaData;
}
