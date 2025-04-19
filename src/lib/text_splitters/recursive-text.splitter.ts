import { Document } from '@langchain/core/documents';
import { IBaseTextSplitter, IRecursiveTextSplitterParams } from './index.type';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

class RecursiveTextSplitter implements IBaseTextSplitter {
  private splitter: RecursiveCharacterTextSplitter;

  constructor(parmas?: Partial<IRecursiveTextSplitterParams>) {
    this.splitter = new RecursiveCharacterTextSplitter(parmas);
  }

  public async splitDocuments(documents: Document[]): Promise<Document[]> {
    return await this.splitter.splitDocuments(documents);
  }
}

export default RecursiveTextSplitter;
