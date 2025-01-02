import { IDocument } from "./document.type";
import mongoVectoreStoreDb from "../../mongoose_client";
import { Schema } from "mongoose";

const docuemntSchema = new Schema<IDocument>({
  name: { type: String, required: true },
  tenantId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const document = mongoVectoreStoreDb.getConnection().model('documents', docuemntSchema);

export default document;