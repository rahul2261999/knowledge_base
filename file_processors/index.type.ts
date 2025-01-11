import { IBaseTextSplitter } from "../text_splitters/index.type";
import { BaseVectorStore } from "../vector_stores/base.interface";

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