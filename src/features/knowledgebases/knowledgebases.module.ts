import { Module } from '@nestjs/common';
import { KnowledgebasesService } from './knowledgebases.service';
import { KnowledgebasesController } from './knowledgebases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Knowledgebase,
  KnowledgebaseSchema,
} from './schema/knowledgebase.schema';
import { KnowledgebaseRepo } from './knowledgebase.repo';
import { DocumentController } from './document/document.controller';
import { DocumentService } from './document/document.service';
import { DocumentRepo } from './document/document.repo';
import { Document, DocumentSchema } from './document/schema/document.schema';
import { AwsS3Module } from 'src/lib/aws_s3/aws-s3.module';
import { TriggerModule } from '../events/trigger/triggers.module';
import { PineconeVectorStoreModule } from 'src/lib/vector_store/pinecone/pinecone-vector-store.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { FileStorage } from 'src/utils/file-storage';
import { WebsiteService } from './website/website.service';
import { WebsiteController } from './website/website.controller';
import { WebsiteRepo } from './website/website.repo';
import { Website, WebsiteSchema } from './website/schema/website.schema';
import { CrawlerModule } from '../crawler/crawler.module';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: path.join(FileStorage.getDirPath('uploads')),
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueSuffix);
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: Knowledgebase.name, schema: KnowledgebaseSchema },
      { name: Document.name, schema: DocumentSchema },
      { name: Website.name, schema: WebsiteSchema },
    ]),
    AwsS3Module,
    TriggerModule,
    PineconeVectorStoreModule,
    CrawlerModule
  ],
  controllers: [
    KnowledgebasesController,
    DocumentController,
    WebsiteController,
  ],
  providers: [
    KnowledgebaseRepo,
    KnowledgebasesService,
    DocumentService,
    DocumentRepo,
    WebsiteService,
    WebsiteRepo,
  ],
  exports: [KnowledgebasesService, DocumentService, WebsiteService],
})
export class KnowledgebasesModule {}
