"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, code, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
    static badRequest(message, details) { return new ApiError(400, 'BAD_REQUEST', message, details); }
    static unauthorized(message = 'Unauthorized', details) { return new ApiError(401, 'UNAUTHORIZED', message, details); }
    static notFound(message = 'Not found') { return new ApiError(404, 'NOT_FOUND', message); }
    static conflict(message, details) { return new ApiError(409, 'CONFLICT', message, details); }
    static forbidden(message = 'Forbidden', details) { return new ApiError(403, 'FORBIDDEN', message, details); }
    static internal(message = 'Internal server error') { return new ApiError(500, 'INTERNAL_SERVER_ERROR', message); }
}
exports.ApiError = ApiError;
//# sourceMappingURL=ApiError.js.map