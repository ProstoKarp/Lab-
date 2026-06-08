"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const error_handler_middleware_1 = require("./middleware/error-handler.middleware");
const logger_middleware_1 = require("./middleware/logger.middleware");
const events_routes_1 = __importDefault(require("./routes/events.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const registrations_routes_1 = __importDefault(require("./routes/registrations.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
]);
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(logger_middleware_1.LoggerMiddleware.log);
        this.app.use((req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('Referrer-Policy', 'no-referrer');
            res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
            const origin = req.headers.origin;
            if (!origin || allowedOrigins.has(origin)) {
                if (origin)
                    res.header('Access-Control-Allow-Origin', origin);
                res.header('Vary', 'Origin');
                res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Demo-UserId');
            }
            if (req.method === 'OPTIONS') {
                res.sendStatus(!origin || allowedOrigins.has(origin) ? 204 : 403);
                return;
            }
            if (origin && !allowedOrigins.has(origin)) {
                res.status(403).json({ error: { code: 'CORS_FORBIDDEN', message: 'CORS origin is not allowed', statusCode: 403, details: origin } });
                return;
            }
            next();
        });
        this.app.use('/api/v1/health', health_routes_1.default);
        this.app.use('/api/v1/users', users_routes_1.default);
        this.app.use('/api/v1/events', events_routes_1.default);
        this.app.use('/api/v1/registrations', registrations_routes_1.default);
        // Backward-compatible aliases for older Postman checks from Lab 03.
        this.app.use('/api/health', health_routes_1.default);
        this.app.use('/api/users', users_routes_1.default);
        this.app.use('/api/events', events_routes_1.default);
        this.app.use('/api/registrations', registrations_routes_1.default);
        this.app.get('/', (req, res) => res.json({ data: { message: 'Board Application API', version: '1.0.0', api: '/api/v1' } }));
        this.app.use((req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found', statusCode: 404, details: req.originalUrl } }));
        this.app.use(error_handler_middleware_1.ErrorHandlerMiddleware.handle);
    }
    listen(port) {
        this.app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map