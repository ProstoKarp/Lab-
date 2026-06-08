"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoAuth = demoAuth;
exports.currentUserId = currentUserId;
const ApiError_1 = require("../errors/ApiError");
const users_repository_1 = require("../repositories/users.repository");
const usersRepository = new users_repository_1.UsersRepository();
async function demoAuth(req, res, next) {
    try {
        const raw = req.header('X-Demo-UserId');
        if (!raw)
            throw ApiError_1.ApiError.unauthorized('X-Demo-UserId header is required');
        const userId = Number(raw);
        if (!Number.isInteger(userId) || userId <= 0)
            throw ApiError_1.ApiError.unauthorized('X-Demo-UserId must be a positive integer');
        const user = await usersRepository.findById(userId);
        if (!user)
            throw ApiError_1.ApiError.unauthorized('Demo user not found');
        req.currentUserId = userId;
        next();
    }
    catch (e) {
        next(e);
    }
}
function currentUserId(req) {
    return req.currentUserId;
}
//# sourceMappingURL=demo-auth.middleware.js.map