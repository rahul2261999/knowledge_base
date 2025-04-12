import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ProcessingStatus, Status } from 'src/core/constants/global.enum';
import { BaseSchema } from 'src/core/schema/base.schema';

@Schema({
  timestamps: true,
  collection: 'documents',
})
export class Document extends BaseSchema {
  @Prop({
    type: String,
    required: true,
  })
  tenantId: string;

  @Prop({
    type: String,
    required: true,
  })
  knowledgebaseId: string;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    default: 'general',
  })
  tag: string;

  @Prop({
    type: Number,
    required: true,
  })
  size: number;

  @Prop({
    type: String,
    required: true,
  })
  url: string;

  @Prop({
    enum: ProcessingStatus,
    default: ProcessingStatus.PENDING,
  })
  processingStatus: ProcessingStatus;

  @Prop({
    enum: Status,
    default: Status.ACTIVE,
    required: true,
  })
  status?: Status;

  @Prop({
    type: String,
  })
  createdBy?: string;

  @Prop({
    type: String,
  })
  updatedBy?: string;
}

export type DocumentDocument = HydratedDocument<Document>;
export const DocumentSchema = SchemaFactory.createForClass(Document);
