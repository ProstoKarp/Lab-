export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public details?: unknown) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
  static badRequest(message: string, details?: unknown): ApiError { return new ApiError(400, message, details); }
  static notFound(message = 'Not found'): ApiError { return new ApiError(404, message); }
  static conflict(message: string, details?: unknown): ApiError { return new ApiError(409, message, details); }
  static forbidden(message = 'Forbidden', details?: unknown): ApiError { return new ApiError(403, message, details); }
  static internal(message = 'Internal server error'): ApiError { return new ApiError(500, message); }
}
