export class ApiError extends Error {
  constructor(public statusCode: number, public code: string, message: string, public details?: unknown) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
  static badRequest(message: string, details?: unknown): ApiError { return new ApiError(400, 'BAD_REQUEST', message, details); }
  static unauthorized(message = 'Unauthorized', details?: unknown): ApiError { return new ApiError(401, 'UNAUTHORIZED', message, details); }
  static notFound(message = 'Not found'): ApiError { return new ApiError(404, 'NOT_FOUND', message); }
  static conflict(message: string, details?: unknown): ApiError { return new ApiError(409, 'CONFLICT', message, details); }
  static forbidden(message = 'Forbidden', details?: unknown): ApiError { return new ApiError(403, 'FORBIDDEN', message, details); }
  static internal(message = 'Internal server error'): ApiError { return new ApiError(500, 'INTERNAL_SERVER_ERROR', message); }
}
