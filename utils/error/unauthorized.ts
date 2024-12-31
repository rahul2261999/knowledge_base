import constant from "../../constants/constant";
import BaseError from "./base.error";

class UnAuthorized extends BaseError {
   constructor(message: string, options?: { correlationId?: string, error?: any[] }) {
      super(
        message, 
        constant.statusCodes.UNAUTHORIZED, 
        { 
          error: options?.error ?? [], 
          correlationId: options?.correlationId 
        });
    }
}