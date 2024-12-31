import constant from "../../constants/constant";
import BaseError from "./base.error";

class NotFound extends BaseError {
   constructor(message: string, options?: { correlationId?: string, error?: any[] }) {
      super(
        message, 
        constant.statusCodes.NOT_FOUND, 
        { 
          error: options?.error ?? [], 
          correlationId: options?.correlationId 
        });
    }
}

export default NotFound;