export declare class ApiError extends Error {
    statusCode: number;
    code: string;
    details?: unknown | undefined;
    constructor(statusCode: number, code: string, message: string, details?: unknown | undefined);
    static badRequest(message: string, details?: unknown): ApiError;
    static unauthorized(message?: string, details?: unknown): ApiError;
    static notFound(message?: string): ApiError;
    static conflict(message: string, details?: unknown): ApiError;
    static forbidden(message?: string, details?: unknown): ApiError;
    static internal(message?: string): ApiError;
}
//# sourceMappingURL=ApiError.d.ts.map