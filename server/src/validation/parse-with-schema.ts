import type { z } from "zod";
import { toValidationError } from "./validation-error.js";

export const parseWithSchema = <TSchema extends z.ZodTypeAny>(schema: TSchema, input: unknown): z.infer<TSchema> => {
    const result = schema.safeParse(input);

    if (!result.success) {
        throw toValidationError(result.error.issues[0]?.message ?? "Geçersiz istek verisi gönderildi");
    }

    return result.data;
};
