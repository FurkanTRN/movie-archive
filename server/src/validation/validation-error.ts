import { AppError } from "../middleware/error-handler.js";

export const toValidationError = (message: string) => {
    return new AppError(message, 400);
};
