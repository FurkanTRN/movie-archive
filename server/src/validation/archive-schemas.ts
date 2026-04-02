import { z } from "zod";

const watchedAtSchema = z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" ? value.trim() : value))
    .refine((value) => {
        if (value == null || value === "") {
            return true;
        }

        return !Number.isNaN(new Date(value).getTime());
    }, "Watched date must be a valid date")
    .transform((value) => {
        if (value == null || value === "") {
            return null;
        }

        return new Date(value).toISOString();
    });

const notesSchema = z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
        const trimmed = value?.trim();
        return trimmed ? trimmed : null;
    });

const personalRatingSchema = z
    .union([z.number(), z.null(), z.undefined()])
    .refine((value) => value == null || (Number.isInteger(value) && value >= 1 && value <= 10), {
        message: "Personal rating must be an integer between 1 and 10",
    })
    .transform((value) => value ?? null);

export const archiveQuerySchema = z.object({
    genre: z.string().trim().min(1, "Genre filter is invalid").optional(),
    limit: z.coerce.number().int("Page size must be between 1 and 12").min(1, "Page size must be between 1 and 12").max(12, "Page size must be between 1 and 12").default(12),
    minRating: z.coerce.number().int("Personal rating filter must be between 1 and 10").min(1, "Personal rating filter must be between 1 and 10").max(10, "Personal rating filter must be between 1 and 10").optional(),
    page: z.coerce.number().int("Page number must be 1 or greater").min(1, "Page number must be 1 or greater").default(1),
    q: z.string().trim().optional(),
    sort: z.enum(["rating", "recent", "releaseYearDesc", "title", "watchedAt"]).optional(),
    year: z.coerce.number().int("Year filter is invalid").min(1888, "Year filter is invalid").optional(),
});

export const archiveCreateBodySchema = z.object({
    notes: notesSchema,
    personalRating: personalRatingSchema,
    tmdbId: z.coerce.number().int("A valid movie ID must be provided").positive("A valid movie ID must be provided"),
    watchedAt: watchedAtSchema,
});

export const archiveUpdateBodySchema = z.object({
    notes: notesSchema,
    personalRating: personalRatingSchema,
    watchedAt: watchedAtSchema,
});

export const archiveIdParamsSchema = z.object({
    id: z.coerce.number().int("A valid archive entry ID must be provided").positive("A valid archive entry ID must be provided"),
});
