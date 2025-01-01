import constant from "../../constants/constant";
import { asyncLocalStorage } from "../helper/store.util";
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
    if (error instanceof Error) {
      const store = asyncLocalStorage.getStore();
   
      return new InternalServer('Something went wrong')
    } else {
      return error as BaseError
    }
  }
}

export default InternalServer;