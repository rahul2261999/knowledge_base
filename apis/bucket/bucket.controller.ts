import { Request, Response } from "express";
import InternalServer from "../../utils/error/internal_server.error";
import loggerService from "../../utils/logger/logger.service";
import { ILoggerData } from "../../utils/logger/logger.type";
import bucketService from "./bucket.service";
import SuccessResponse from "../../utils/response/response.util";

export const bucketCreate = async (request: Request, response: Response) => {
  const loggerData: ILoggerData = {
    controller: 'Bucket',
    serviceName: 'bucketCreate',
    message: 'executing',
  }

  try {
    loggerService.info(loggerData);

    const data = await bucketService.bucketCreate(request.body);

    const res = new SuccessResponse('Bucket created successfully', { data });

    loggerData.message = "executed";
    loggerService.info(loggerData);

    response.status(res.statusCode).json(res);
  } catch (error) {
    loggerData.message = "error executing";
    loggerService.error(loggerData);

    const customError = InternalServer.fromError(error);

    response.status(customError.getStatusCode()).json(customError.toJson());
  }
}

export const bucketGet = async (request: Request, response: Response) => {
  const loggerData: ILoggerData = {
    controller: 'Bucket',
    serviceName: 'bucketGet',
    message: 'executing',
  }

  try {
    loggerService.info(loggerData);

    const data = await bucketService.bucketGet({
      bucketId: request.params.bucketId,
      tenantId: request.params.tenantId
    });

    const res = new SuccessResponse('Bucket retrieved successfully', { data });

    loggerData.message = "executed";
    loggerService.info(loggerData);

    response.status(res.statusCode).json(res);
  } catch (error) {
    loggerData.message = "error executing";
    loggerService.error(loggerData);

    const customError = InternalServer.fromError(error);

    response.status(customError.getStatusCode()).json(customError.toJson());
  }
}

export const bucketGetAll = async (request: Request, response: Response) => {
  const loggerData: ILoggerData = {
    controller: 'Bucket',
    serviceName: 'bucketGetAll',
    message: 'executing',
  }

  try {
    loggerService.info(loggerData);

    const data = await bucketService.bucketGetAll({
      tenantId: request.params.tenantId
    });

    const res = new SuccessResponse('Buckets retrieved successfully', { data });

    loggerData.message = "executed";
    loggerService.info(loggerData);

    response.status(res.statusCode).json(res);
  } catch (error) {
    loggerData.message = "error executing";
    loggerService.error(loggerData);

    const customError = InternalServer.fromError(error);

    response.status(customError.getStatusCode()).json(customError.toJson());
  }
}

export const bucketUpdate = async (request: Request, response: Response) => {
  const loggerData: ILoggerData = {
    controller: 'Bucket',
    serviceName: 'bucketUpdate',
    message: 'executing',
  }

  try {
    loggerService.info(loggerData);

    const data = await bucketService.bucketUpdate(request.body);

    const res = new SuccessResponse('Bucket updated successfully', { data });

    loggerData.message = "executed";
    loggerService.info(loggerData);

    response.status(res.statusCode).json(res);
  } catch (error) {
    loggerData.message = "error executing";
    loggerService.error(loggerData);

    const customError = InternalServer.fromError(error);

    response.status(customError.getStatusCode()).json(customError.toJson());
  }
}

export const bucketDelete = async (request: Request, response: Response) => {
  const loggerData: ILoggerData = {
    controller: 'Bucket',
    serviceName: 'bucketDelete',
    message: 'executing',
  }

  try {
    loggerService.info(loggerData);

    const data = await bucketService.bucketDelete(request.body);

    const res = new SuccessResponse('Bucket deleted successfully', { data });

    loggerData.message = "executed";
    loggerService.info(loggerData);

    response.status(res.statusCode).json(res);
  } catch (error) {
    loggerData.message = "error executing";
    loggerService.error(loggerData);

    const customError = InternalServer.fromError(error);

    response.status(customError.getStatusCode()).json(customError.toJson());
  }
}