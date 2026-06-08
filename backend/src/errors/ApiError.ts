export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;

  constructor(
    statusCode: number,
    message: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, details?: Record<string, any>) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Not found') {
    return new ApiError(404, message);
  }

  static conflict(message: string, details?: Record<string, any>) {
    return new ApiError(409, message, details);
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(500, message);
  }
}
