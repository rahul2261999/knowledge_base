import { Request, Response } from "express";
import { ILoggerData } from "../../utils/logger/logger.type";
import loggerService from "../../utils/logger/logger.service";
import InternalServer from "../../utils/error/internal_server.error";
import ingestionService from "./ingestion.service";
import SuccessResponse from "../../utils/response/response.util";

export const createIngestTrainingData = async (request: Request, response: Response) => {
  const loggerData: ILoggerData = {
    controller: 'IngestionController',
    serviceName: 'createIngestTrainingData',
    message: 'executing',
  }

  try {
    loggerService.info(loggerData);

    const data = await ingestionService.uploadTrainingData({
      file: request.file!,
      metaData: request.body
    });

    loggerData.message = "executed";
    loggerService.info(loggerData);

    const res = new SuccessResponse('Training completed successfully', { data });
    response.status(res.statusCode).json(res);
  } catch (error) {
    loggerData.message = "error executing";
    loggerService.error(loggerData);

    const customError = InternalServer.fromError(error);

    response.status(customError.getStatusCode()).json(customError.toJson());
  }
}

export const deleteIngestTrainingData = async (request: Request, response: Response) => {
  const loggerData: ILoggerData = {
    controller: 'IngestionController',
    serviceName: 'deleteIngestTrainingData',
    message: 'executing',
  }

  try {
    loggerService.info(loggerData);

    const data = await ingestionService.deleteTrainingData(request.body);

    loggerData.message = "executed";
    loggerService.info(loggerData);

    const res = new SuccessResponse('Training data deleted successfully', { data });
    response.status(res.statusCode).json(res);
  } catch (error) {
    loggerData.message = "error executing";
    loggerService.error(loggerData);

    const customError = InternalServer.fromError(error);

    response.status(customError.getStatusCode()).json(customError.toJson());
  }
}