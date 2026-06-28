import { AppError } from "../utils/AppError.js";

export function notFoundHandler(request, _response, next) {
    next(new AppError(`Route ${request.method} ${request.originalUrl} not found`, 404));
}
