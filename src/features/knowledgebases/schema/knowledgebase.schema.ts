import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Status } from 'src/core/constants/global.enum';
import { BaseSchema } from 'src/core/schema/base.schema';

@Schema({
  timestamps: true,
  collection: 'knowledgebases',
})
export class Knowledgebase extends BaseSchema {
  @Prop({
    type: String,
    required: true,
  })
  tenantId: string;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    enum: Status,
    default: Status.ACTIVE,
    required: true,
  })
  status: Status;

  @Prop({
    type: String,
    required: true,
  })
  createdBy: string;

  @Prop({
    type: String,
    required: true,
  })
  updatedBy: string;
}

export type KnowledgebaseDocument = HydratedDocument<Knowledgebase>;
export const KnowledgebaseSchema = SchemaFactory.createForClass(Knowledgebase);
