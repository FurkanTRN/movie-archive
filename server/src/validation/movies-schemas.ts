import { z } from "zod";

export const movieSearchQuerySchema = z.object({
    q: z.string().trim().min(1, "Search query is required"),
});

export const movieIdParamsSchema = z.object({
    tmdbId: z.coerce.number().int("A valid movie ID must be provided").positive("A valid movie ID must be provided"),
});
