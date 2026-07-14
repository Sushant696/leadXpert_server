import { StatusCodes } from "http-status-codes";

/**
 * Application-level error carrying an HTTP status code.
 *
 * Thrown from services/controllers and handled centrally in
 * `errorHandler`, which reads `.status` and `.message` to build the
 * JSON error response.
 */
class ApiError extends Error {
  public readonly status: number;

  constructor(status: number = StatusCodes.INTERNAL_SERVER_ERROR, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";

    // Restore prototype chain so `instanceof ApiError` works after transpile.
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export default ApiError;
