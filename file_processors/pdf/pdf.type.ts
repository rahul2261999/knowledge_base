export interface IPdfLoaderParams {
  filepathOrBlob: string | Blob;
  pdfLoaderOptions?: {
    splitPages?: boolean | undefined;
    parsedItemSeparator?: string | undefined;
  }
}