import { Document } from "@langchain/core/documents";
import { IBaseTextSplitter } from "../text_splitters/index.type";

export interface IBaseFileProcessor {
  load(): Promise<Document[]>;
  split(textsplitterProcessor?: IBaseTextSplitter): Promise<Document[]>;
  store(): Promise<void>;
}