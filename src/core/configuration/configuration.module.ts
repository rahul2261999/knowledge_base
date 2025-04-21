import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationService } from './configuration.service';
import Joi from 'joi';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        () => {
          let yamlConfig: any = {};

          const configPath = path.join(
            __dirname,
            'env-config',
            `${process.env.NODE_ENV}.yaml`,
          );

          try {
            const fileContents = fs.readFileSync(configPath, 'utf8');

            yamlConfig = yaml.load(fileContents) as Record<string, any>;
          } catch (error) {
            Logger.error('Error loading YAML configuration:', error);

            yamlConfig = {};
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return {
            ...yamlConfig,
            ...process.env,
          };
        },
      ],
      validationSchema: Joi.object({
        // ========== .env config ==============
        NODE_ENV: Joi.string().valid('dev', 'staging', 'uat').required(),
        PORT: Joi.number(),

        MONGODB_ATLAS_URI: Joi.string().required(),

        PINECONE_API_KEY: Joi.string().required(),
        PINECONE_INDEX_NAME: Joi.string().required(),
        PINECONE_INDEX_HOST: Joi.string().required(),

        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),

        AZURE_OPENAI_API_KEY: Joi.string().required(),
        AZURE_OPENAI_API_INSTANCE_NAME: Joi.string().required(),
        AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME: Joi.string().required(),
        AZURE_OPENAI_API_VERSION: Joi.string().required(),

        VOYAGE_API_KEY: Joi.string().required(),
        VOYAGE_MODEL: Joi.string().required(),

        // =============== yaml config =============== //
        AwsS3: Joi.object({
          buckets: Joi.object({
            knowledgebase: Joi.string().required(),
            crawler: Joi.string().required(),
          }),
        }),
        AwsSqs: Joi.object({
          Queues: Joi.object({
            FileProcessingQueue: Joi.string().required(),
            CrawlContentQueue: Joi.string().required(),
          }),
        }),
      }),
      envFilePath: '.env',
    }),
  ],
  providers: [ConfigurationService],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
