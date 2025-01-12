import { Request, Response, Router } from "express";
import loggerService from "../utils/logger/logger.service";
import ingestionRouter from "./ingestion/ingestion.route";

const router = Router();

router.get('/health', (_: Request, res: Response) => {
  try {
    loggerService.info("Server health is good!");

    res.status(200).json({ message: "Server health is good!" });
  } catch (error) {

    loggerService.error("Server health is bad!");
    
    res.status(500).json({ message: "Server health is bad!" });
  }
});

router.use('/ingestion', ingestionRouter);

export default router;