import constant from "../../constants/constant";
import BaseError from "./base.error";

class InternalServer extends BaseError {

  constructor(message: string, options?: { correlationId?: string, error?: any[] }) {
    super(
      message, 
      constant.statusCodes.INTERNAL_SERVER, 
      { 
        error: options?.error ?? [], 
        correlationId: options?.correlationId 
      });
  }
}

export default InternalServer;