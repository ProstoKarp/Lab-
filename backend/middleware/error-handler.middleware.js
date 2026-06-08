"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandlerMiddleware = void 0;
const ApiError_1 = require("../errors/ApiError");
class ErrorHandlerMiddleware {
    static handle(error, req, res, next) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('[Error]', error);
        if (error instanceof ApiError_1.ApiError) {
            res.status(error.statusCode).json({ error: { message: error.message, statusCode: error.statusCode, details: error.details || null } });
            return;
        }
        if (msg.includes('UNIQUE constraint failed')) {
            res.status(409).json({ error: { message: 'Unique constraint violation', statusCode: 409, details: msg } });
            return;
        }
        if (msg.includes('CHECK constraint failed') || msg.includes('NOT NULL constraint failed') || msg.includes('FOREIGN KEY constraint failed') || msg.includes('must be')) {
            res.status(400).json({ error: { message: 'Invalid data', statusCode: 400, details: msg } });
            return;
        }
        res.status(500).json({ error: { message: 'Internal server error', statusCode: 500 } });
    }
}
exports.ErrorHandlerMiddleware = ErrorHandlerMiddleware;
//# sourceMappingURL=error-handler.middleware.js.map