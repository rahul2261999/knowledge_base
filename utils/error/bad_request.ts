import constant from "../../constants/constant";
import { asyncLocalStorage } from "../helper/store.util";
import BaseError from "./base.error";
import InternalServer from "./internal_server.error";

class BadRequest extends BaseError {
  constructor(message: string, options?: { correlationId?: string, error?: any[] }) {
    super(
      message,
      constant.statusCodes.BAD_REQUEST,
      { error: options?.error ?? [], }
    );
  }
}

export default BadRequest;