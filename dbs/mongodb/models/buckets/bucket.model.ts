import mongoose from "mongoose";
import { BucketStatus, IBucket } from "./bucket.type";

const bucketSchema = new mongoose.Schema<IBucket>(
  {
    name: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    status: {
      type: mongoose.Schema.Types.String,
      enum: Object.values(BucketStatus),
      default: BucketStatus.ACTIVE,
    },
    createdBy: {
      type: mongoose.Schema.Types.Number,
    },
    updatedBy: {
      type: mongoose.Schema.Types.Number,
    },

    createdAt: {
      type: mongoose.Schema.Types.Date,
      default: Date.now,
    },
    updatedAt: {
      type: mongoose.Schema.Types.Date,
      default: Date.now,
    }
  },
  { timestamps: true }
)

const Bucket = mongoose.model<IBucket>("bucket", bucketSchema);

export default Bucket;