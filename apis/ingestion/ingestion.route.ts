import { Router } from "express";
import multerService from "../../utils/multer/multer.service";
import { createIngestTrainingData, deleteIngestTrainingData } from "./ingestion.controller";

const ingestionRouter = Router();

ingestionRouter.post('/training', multerService.getUpload().single('file'), createIngestTrainingData)
ingestionRouter.delete('/training', deleteIngestTrainingData)


export default ingestionRouter;