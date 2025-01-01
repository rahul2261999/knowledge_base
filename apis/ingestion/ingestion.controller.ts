import { Request, Response } from "express";
import { ILoggerData } from "../../utils/logger/logger.type";
import loggerService from "../../utils/logger/logger.service";
import InternalServer from "../../utils/error/internal_server.error";
import ingestionService from "./ingestion.service";
import SuccessResponse from "../../utils/response/response.util";

export const ingestTrainingData = async (request: Request, response: Response) => {
  const loggerData: ILoggerData = {
    controller: 'IngestionController',
    serviceName: 'ingestTrainingData',
    message: 'executing',
  }

  try {
    loggerService.info(loggerData);

    await ingestionService.uploadTrainingData({
      file: request.file!,
      metaData: request.body
    });

    loggerData.message = "executed";
    loggerService.info(loggerData);

    const res = new SuccessResponse('Training started successfully');

    response.status(res.statusCode).json(res);
  } catch (error) {
    loggerData.message = "error executing";
    loggerService.error(loggerData);

    const customError =  InternalServer.fromError(error);

    response.status(customError.getStatusCode()).json(customError.toJson());
  }
}