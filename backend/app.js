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
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(logger_middleware_1.LoggerMiddleware.log);
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
                return;
            }
            next();
        });
        this.app.use('/api/health', health_routes_1.default);
        this.app.use('/api/users', users_routes_1.default);
        this.app.use('/api/events', events_routes_1.default);
        this.app.use('/api/registrations', registrations_routes_1.default);
        this.app.get('/', (req, res) => res.json({ data: { message: 'Board Application API', version: '0.3.0' } }));
        this.app.use((req, res) => res.status(404).json({ error: { message: 'Route not found', statusCode: 404 } }));
        this.app.use(error_handler_middleware_1.ErrorHandlerMiddleware.handle);
    }
    listen(port) {
        this.app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map