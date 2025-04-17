import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { CrawlingSessionStatus } from 'src/core/constants/global.enum';

@Schema({
  timestamps: true,
  collection: 'crawling_sessions',
})
export class CrawlingSession {
  @Prop({
    type: String,
    required: true,
  })
  websiteId: String;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  totalUrls: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  urlsCrawled: number;

  @Prop({
    enum: CrawlingSessionStatus,
    default: CrawlingSessionStatus.IN_PROGRESS,
  })
  status: CrawlingSessionStatus;

  @Prop({
    type: String,
    default: null,
  })
  failureReason: JSON | string | null;

  @Prop({
    type: Boolean,
    required: true,
    default: true,
  })
  active: boolean;

  @Prop({
    type: Date,
    default: Date.now,
  })
  createdAt?: Date;

  @Prop({
    type: Date,
    default: Date.now,
  })
  updatedAt?: Date;
}

export type CrawlingSessionDocument = HydratedDocument<CrawlingSession>;
export const CrawlingSessionSchema =
  SchemaFactory.createForClass(CrawlingSession);
