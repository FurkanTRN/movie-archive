import { z } from "zod";
import { toIsoDateString } from "@/components/application/archive/archive-utils";
import type { DateValue } from "react-aria-components";

export const loginFormSchema = z.object({
    email: z.string().trim().min(1, "E-posta zorunludur").email("Geçerli bir e-posta girilmelidir"),
    password: z.string().trim().min(1, "Şifre zorunludur"),
});

const personalRatingSchema = z
    .string()
    .trim()
    .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 10), {
        message: "Kişisel puan 1 ile 10 arasında tam sayı olmalıdır",
    });

export const archiveFormSchema = z
    .object({
        isWatchedDateUnknown: z.boolean(),
        notes: z.string(),
        personalRating: personalRatingSchema,
        watchedAt: z.custom<DateValue | null>(),
    })
    .superRefine((value, context) => {
        if (!value.isWatchedDateUnknown && !value.watchedAt) {
            context.addIssue({
                code: "custom",
                message: "İzleme tarihi zorunludur",
                path: ["watchedAt"],
            });
        }
    })
    .transform((value) => ({
        notes: value.notes.trim(),
        personalRating: value.personalRating.trim() ? Number(value.personalRating.trim()) : null,
        watchedAt: value.isWatchedDateUnknown ? null : toIsoDateString(value.watchedAt),
    }));
