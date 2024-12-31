import constant from "../../constants/constant";

class SuccessResponse<T> {
  public correlationId: string;
  public statusCode: number;
  public data: T;

  constructor(correlationId: string, data: T, options?: { statusCode: number }) {
    this.correlationId = correlationId;
    this.statusCode = options?.statusCode ?? constant.statusCodes.OK;
    this.data = data;
  }
}

export default SuccessResponse;