import { Router } from "express";
import { bucketCreate, bucketDelete, bucketGet, bucketGetAll, bucketUpdate } from "./bucket.controller";

const bucketRouter = Router();

bucketRouter.get('/:tenantId/:bucketId', bucketGet);
bucketRouter.get('/:tenantId', bucketGetAll);
bucketRouter.post('/', bucketCreate);
bucketRouter.put('/', bucketUpdate);
bucketRouter.delete('/', bucketDelete);

export { bucketRouter }