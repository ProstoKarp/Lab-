"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
    static badRequest(message, details) { return new ApiError(400, message, details); }
    static notFound(message = 'Not found') { return new ApiError(404, message); }
    static conflict(message, details) { return new ApiError(409, message, details); }
    static forbidden(message = 'Forbidden', details) { return new ApiError(403, message, details); }
    static internal(message = 'Internal server error') { return new ApiError(500, message); }
}
exports.ApiError = ApiError;
//# sourceMappingURL=ApiError.js.map