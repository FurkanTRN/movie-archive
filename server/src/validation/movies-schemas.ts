import { z } from "zod";

export const movieSearchQuerySchema = z.object({
    q: z.string().trim().min(1, "Arama parametresi zorunludur"),
});

export const movieIdParamsSchema = z.object({
    tmdbId: z.coerce.number().int("Geçerli bir film kimliği gönderilmelidir").positive("Geçerli bir film kimliği gönderilmelidir"),
});
