/**
 * Standard success response envelope.
 *
 * Controllers return `res.json(new ApiResponse(statusCode, message, data))`
 * to keep the response shape consistent across the API.
 */
class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly status: number;
  public readonly message: string;
  public readonly data?: T;

  constructor(status: number, message: string, data?: T) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.success = status < 400;
  }
}

export default ApiResponse;
