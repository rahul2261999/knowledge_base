export interface Loc {
  lines: {
    from: number;
    to: number;
  };
  pageNumber: number;
}

export interface VectorDocumentMetadata {
  bucketName: string;
  documentId: string;
  filename: string;
  knowledgebaseId: string;
  loc: Loc;
  source: string;
}

export interface VectorDocument {
  id: string;
  text: string;
  metadata: {
    [keys: string]: string | boolean | number | Array<string>;
  };
}

export interface VectorFilter {
  prefix: string;
  // filter?: Partial<Omit<VectorDocumentMetadata, 'loc'>>
}

export interface FetchedVectorDocument
  extends Omit<VectorDocument, 'metadata'> {
  metadata: VectorDocumentMetadata;
}
