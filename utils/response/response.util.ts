import constant from "../../constants/constant";
import { asyncContextStore } from "../helper/async_context_store.util";

class SuccessResponse<T> {
  public tracingId: string | null;
  public message: string;
  public statusCode: number;
  public data: T | null;

  constructor(message: string, options?: Partial<{ statusCode: number, data: T }>) {
    this.tracingId = asyncContextStore.getTraceId();
    this.message = message;
    this.statusCode = options?.statusCode ?? constant.statusCodes.OK;
    this.data = options?.data ?? null;
  }
}

export default SuccessResponse;