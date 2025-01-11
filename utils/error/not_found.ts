import constant from "../../constants/constant";
import BaseError from "./base.error";

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