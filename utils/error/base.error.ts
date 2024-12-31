import InternalServer from "./internal_server.error";

abstract class BaseError extends Error {
  protected correlationId: string | null;
  protected statusCode: number;
  protected error?: any[];


  constructor(message: string, statusCode: number, options?: { correlationId?: string, error: any[] }) {
    super(message);
    this.correlationId = options?.correlationId ?? null;
    this.statusCode = statusCode;
    this.error = options?.error ?? [];

    // Capture the stack trace, skipping the constructor function itself
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack; // Fallback for non-V8 environments
    }

    // Fix the prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public static fromError<T>(error: T, correlationId?: string): BaseError {
    if (error instanceof Error) {
      return new InternalServer('Something went wrong', { correlationId })
    } else {
      return error as BaseError
    }
  }
}

export default BaseError;