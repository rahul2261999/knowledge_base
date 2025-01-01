import { config } from "dotenv"

config();

export default Object.freeze({
  app: {
    port: Number(process.env.PORT) || 5008
  },
  model: {
    name: "open-mistral-nemo",
    apiKey: process.env.MISTRAL_API_KEY
  },
  mongo: {
    uri: process.env.MONGODB_ATLAS_URI || '',
    db: process.env.MONGODB_ATLAS_DB_NAME || '',
    collection: process.env.MONGODB_ATLAS_COLLECTION_NAME || ''
  },
  statusCodes: {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER: 500,
    UNAUTHORIZED: 501,
    FORBIDDEN: 403
  }
})