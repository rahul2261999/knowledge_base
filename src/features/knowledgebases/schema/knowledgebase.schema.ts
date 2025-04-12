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
    required: true
  })
  knowledgebaseId: string;

  @Prop({
    type: String,
    required: true,
  })
  customerId: string;

  @Prop({
    type: String,
    required: true,
  })
  userId: string;

  @Prop({
    enum: Status,
    default: Status.ACTIVE,
    required: true
  })
  status?: Status;
}

export type KnowledgebaseDocument = HydratedDocument<Knowledgebase>;
export const KnowledgebaseSchema = SchemaFactory.createForClass(Knowledgebase);
