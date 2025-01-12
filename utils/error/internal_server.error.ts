import constant from "../../constants/constant";
import loggerService from "../logger/logger.service";
import BaseError from "./base.error";

class InternalServer extends BaseError {

  constructor(message: string, options?: { error?: any[] }) {
    super(
      message,
      constant.statusCodes.INTERNAL_SERVER,
      {
        error: options?.error ?? [],
      }
    );
  }

  public static fromError(error: any): BaseError {
    if (error.constructor.name === Error.name) {
      loggerService.error('', { error });

      return new InternalServer('Something went wrong')
    } else {
      return error as BaseError
    }
  }
}

export default InternalServer;