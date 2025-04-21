import { BaseEmbeddingModel, BaseEmbeddingOptions } from '../index.type';

/**
 * Voyage specific embedding options
 */
export interface VoyageEmbeddingOptions extends BaseEmbeddingOptions {
  input_type: 'query' | 'document';
  truncate?: boolean;
}

/**
 * Voyage model configuration
 */
export interface VoyageModel extends BaseEmbeddingModel {
  // Voyage-specific model configuration
  modelVersion?: string;
}

/**
 * Voyage API response structure
 */
export interface VoyageEmbeddingResponse {
  data: {
    embedding: number[];
    index: number;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingOptions {
  truncation?: boolean;
  input_type?: 'query' | 'document';
  output_dimension?: 256 | 512 | 1024 | 2048;
  output_dtype?: 'float' | 'int8' | 'uint8';
}
