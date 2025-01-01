import { Router } from "express";
import multerService from "../../utils/multer/multer.service";
import { ingestTrainingData } from "./ingestion.controller";

const ingestionRouter = Router();

ingestionRouter.post('/training', multerService.getUpload().single('file'), ingestTrainingData)

export default ingestionRouter;