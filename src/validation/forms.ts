import { z } from "zod";
import { toIsoDateString } from "@/components/application/archive/archive-utils";
import type { DateValue } from "react-aria-components";

export const loginFormSchema = z.object({
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().trim().min(1, "Password is required"),
});

const personalRatingSchema = z
    .string()
    .trim()
    .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 10), {
        message: "Personal rating must be an integer between 1 and 10",
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
                message: "Watched date is required",
                path: ["watchedAt"],
            });
        }
    })
    .transform((value) => ({
        notes: value.notes.trim(),
        personalRating: value.personalRating.trim() ? Number(value.personalRating.trim()) : null,
        watchedAt: value.isWatchedDateUnknown ? null : toIsoDateString(value.watchedAt),
    }));
