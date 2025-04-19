import { Document } from '@langchain/core/documents';
import { FileExtensions } from 'src/core/constants/global.enum';
import { BaseVectorStore } from '../vector_store/base.interface';
import { IPdfLoaderParams } from './pdf/pdf.type';

export interface BaseFileProcessor {
  filterDocuments(filterFn: (doc: Document) => boolean): void;
  process: () => Promise<Document[]>;
}

export interface IStoreOpions {
  tenantId: string;
  storeInstance?: BaseVectorStore;
  fileMetaData: {
    [key: string]: string | number | boolean;
  };
}

export enum EFileProcessorEvents {
  'PROCESS_INCOMING_FILE' = 'PROCESS_INCOMING_FILE',
}

export interface IProcessIncomingFileAttrs {
  tracingId: string;
  knowledgebaseId: string;
  documentId: string;
}

export interface IDocProcessorBuilderMethods {
  setFilepathOrBlob(filepathOrBlob: string | Blob): this;
  build(): BaseFileProcessor;
}

export interface IPdfProcessorBuilderMethods {
  setFilepathOrBlob(filepathOrBlob: string | Blob): this;
  setLoaderOptions(options: IPdfLoaderParams['pdfLoaderOptions']): this;
  build(): BaseFileProcessor;
}

export interface ITxtProcessorBuilderMethods {
  setFilepathOrBlob(filepathOrBlob: string | Blob): this;
  build(): BaseFileProcessor;
}

export interface BaseFileBuilderMethods {
  [FileExtensions.doc]: IDocProcessorBuilderMethods;
  [FileExtensions.docx]: IDocProcessorBuilderMethods;
  [FileExtensions.pdf]: IPdfProcessorBuilderMethods;
  [FileExtensions.txt]: ITxtProcessorBuilderMethods;
}
