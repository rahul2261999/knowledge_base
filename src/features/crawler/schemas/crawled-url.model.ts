import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { CrawledUrlStatus } from 'src/core/constants/global.enum';

@Schema({
  collection: 'crawl_urls',
})
export class CrawledUrl {
  @Prop({
    type: String,
    required: true,
  })
  url: string;

  @Prop({
    enum: CrawledUrlStatus,
    default: CrawledUrlStatus.PENDING,
  })
  status: CrawledUrlStatus;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CrawlingSession',
  })
  crawlingSessionId: mongoose.Types.ObjectId;
}

export type CrawledUrlDocument = HydratedDocument<CrawledUrl>;
export const CrawledUrlSchema = SchemaFactory.createForClass(CrawledUrl);
