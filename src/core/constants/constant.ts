export default Object.freeze({
  app: {
    port: Number(process.env.PORT) || 5010,
  },
  mongo: {
    uri: process.env.MONGODB_ATLAS_URI || '',
  },
  pinecone: {
    apikey: process.env.PINECONE_API_KEY || '',
    indexName: process.env.PINECONE_INDEX_NAME || '',
    indexHost: process.env.PINECONE_INDEX_HOST || '',
  },
  MimeType: {
    PDF: 'application/pdf',
    DOC: 'application/msword',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    TXT: 'text/plain',
  },
  Queues: {
    CRAWL_CONTENT: 'CRAWL_CONTENT',
  },
});
