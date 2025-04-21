import { BaseEmbeddingModel, BaseEmbeddingOptions } from '../index.type';

/**
 * Azure OpenAI specific embedding options
 */
export interface AzureOpenAIEmbeddingOptions extends BaseEmbeddingOptions {
  // Azure-specific options
  maxTokens?: number;
}

/**
 * Azure OpenAI model configuration
 */
export interface AzureOpenAIModel extends BaseEmbeddingModel {
  azureOpenAIApiKey: string;
  azureOpenAIApiInstanceName: string;
  azureOpenAIApiEmbeddingsDeploymentName: string;
  azureOpenAIApiVersion: string;
}
