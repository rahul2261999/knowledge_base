import constant from "../../constants/constant";
import BaseError from "./base.error";

class BadRequest extends BaseError {
   constructor(message: string, options?: { correlationId?: string, error?: any[] }) {
      super(
        message, 
        constant.statusCodes.BAD_REQUEST, 
        { 
          error: options?.error ?? [], 
          correlationId: options?.correlationId 
        });
    }
}

export default BadRequest;