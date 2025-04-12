import { FileExtensions } from "../constants/global.enum";
import { IBaseTextSplitter } from "../text_splitters/index.type";
import { BaseVectorStore } from "../vector_stores/base.interface";
import { IPdfLoaderParams } from "./pdf/pdf.type";

export interface IBaseFileProcessor {
  load(): Promise<IBaseFileProcessor>;
  split(textsplitterProcessor?: IBaseTextSplitter): Promise<IBaseFileProcessor>;
  store(options?: IStoreOpions): Promise<void>;
}

export interface IStoreOpions {
  storeInstance?: BaseVectorStore,
  fileMetaData: {
    [key: string]: string | number | boolean;
  }
}

export enum EFileProcessorEvents {
  'PROCESS_INCOMING_FILE' = 'PROCESS_INCOMING_FILE'
}

export interface IProcessIncomingFileAttrs {
  tracingId: string;
  filePath: string;
  tenantId: string;
  documentId: string;
}

export interface IDocProcessorBuilderMethods {
  setFilepathOrBlob(filepathOrBlob: string | Blob): this;
  build(): IBaseFileProcessor;
}

export interface IPdfProcessorBuilderMethods {
  setFilepathOrBlob(filepathOrBlob: string | Blob): this;
  setLoaderOptions(options: IPdfLoaderParams['pdfLoaderOptions']): this,
  build(): IBaseFileProcessor;
}

export interface BaseFileBuilderMethods {
  [FileExtensions.doc]: IDocProcessorBuilderMethods,
  [FileExtensions.docx]: IDocProcessorBuilderMethods
  [FileExtensions.pdf]: IPdfProcessorBuilderMethods
 }