import constant from "../../constants/constant";
import { asyncContextStore } from "../helper/async_context_store.util";

class SuccessResponse<T> {
  public correlationId: string | null;
  public message: string;
  public statusCode: number;
  public data: T | null;

  constructor(message: string, options?: Partial<{ statusCode: number, data: T }>) {
    const store = asyncContextStore.getStore();

    this.correlationId = store?.get("correlationId") ?? null;
    this.message = message;
    this.statusCode = options?.statusCode ?? constant.statusCodes.OK;
    this.data = options?.data ?? null;
  }
}

export default SuccessResponse;