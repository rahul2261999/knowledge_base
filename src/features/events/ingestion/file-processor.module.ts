import { Module } from '@nestjs/common';
import { FileProcessorEvents } from './file-processor.event';
import { KnowledgebasesModule } from '../../knowledgebases/knowledgebases.module';
import { AwsS3Module } from 'src/lib/aws_s3/aws-s3.module';
import { PineconeVectorStoreModule } from 'src/lib/vector_store/pinecone/pinecone-vector-store.module';

@Module({
  imports: [KnowledgebasesModule, AwsS3Module, PineconeVectorStoreModule],
  providers: [FileProcessorEvents],
  exports: [FileProcessorEvents],
})
export class FileProcessorModule {}
