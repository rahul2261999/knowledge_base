import { Document } from "@langchain/core/documents";
import { IBaseTextSplitter, IRecursiveTextSplitterParams } from "./index.type";
import { RecursiveCharacterTextSplitter, RecursiveCharacterTextSplitterParams } from '@langchain/textsplitters'

class RecursiveTextSplitter implements IBaseTextSplitter {
  private splitter: RecursiveCharacterTextSplitter;

  constructor(parmas?: Partial<IRecursiveTextSplitterParams>) {
    this.splitter = new RecursiveCharacterTextSplitter(parmas)
  }

  public async splitDocuments(documents: Document[]): Promise<Document[]> {
    try {
      const data = await this.splitter.splitDocuments(documents);

      return data
    } catch (error) {
      throw error;
    }
  }
}

export default RecursiveTextSplitter;