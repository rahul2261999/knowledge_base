/**
 * Generic options interface for embedding generation
 * Each embedding service can extend this with their specific options
 */
export interface BaseEmbeddingOptions {
  input_type?: string;
  [key: string]: unknown;
}

/**
 * Base interface for embedding model configurations
 * Each embedding service should extend this with their specific model config
 */
export interface BaseEmbeddingModel {
  apiKey: string;
  model: string;
  [key: string]: unknown;
}

/**
 * Generic interface for embedding methods
 * T extends BaseEmbeddingModel - The model configuration type
 * O extends BaseEmbeddingOptions - The options type for generating embeddings
 */
export interface BaseEmbeddingMethods<
  T extends BaseEmbeddingModel = BaseEmbeddingModel,
  O extends BaseEmbeddingOptions = BaseEmbeddingOptions,
> {
  /**
   * Get the embedding model configuration
   */
  getEmbeddingModel: () => T;

  /**
   * Generate embeddings for a single text
   * @param text - The text to generate embeddings for
   * @param options - Optional parameters for embedding generation
   */
  generateEmbeddings: (text: string, options?: O) => Promise<number[]>;

  /**
   * Generate embeddings for multiple texts in batch
   * @param texts - Array of texts to generate embeddings for
   * @param options - Optional parameters for embedding generation
   */
  generateEmbeddingsBatch: (
    texts: string[],
    options?: O,
  ) => Promise<number[][]>;
}
