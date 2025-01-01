import constant from "../../constants/constant";
import { asyncLocalStorage } from "../helper/store.util";
import BadRequest from "./bad_request";
import BaseError from "./base.error";
import InternalServer from "./internal_server.error";

class NotFound extends BaseError {
  constructor(message: string, options?: { error?: any[] }) {
    super(
      message,
      constant.statusCodes.NOT_FOUND,
      {
        error: options?.error ?? [],
      }
    );
  }
}

export default NotFound;