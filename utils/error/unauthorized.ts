import constant from "../../constants/constant";
import BaseError from "./base.error";

class UnAuthorized extends BaseError {
  constructor(message: string, options?: { error?: any[] }) {
    super(
      message,
      constant.statusCodes.UNAUTHORIZED,
      {
        error: options?.error ?? [],
      }
    );
  }
}