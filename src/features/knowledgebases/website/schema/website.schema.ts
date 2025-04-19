import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProcessingStatus, Status } from 'src/core/constants/global.enum';
import { BaseSchema } from 'src/core/schema/base.schema';

@Schema({
  timestamps: true,
  collection: 'websites',
})
export class Website extends BaseSchema {
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
  url: string;

  @Prop({
    type: Number,
    required: true,
  })
  depth: number;

  @Prop({
    enum: ProcessingStatus,
    required: true,
    default: ProcessingStatus.PENDING,
  })
  processingStatus: ProcessingStatus;

  @Prop({
    enum: Status,
    required: true,
    default: Status.ACTIVE,
  })
  status: Status;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  createdBy: string | null;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  updatedBy: string | null;
}

export type WebsiteDocument = HydratedDocument<Website>;
export const WebsiteSchema = SchemaFactory.createForClass(Website);
