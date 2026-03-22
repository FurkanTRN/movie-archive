import { z } from "zod";

const watchedAtSchema = z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" ? value.trim() : value))
    .refine((value) => {
        if (value == null || value === "") {
            return true;
        }

        return !Number.isNaN(new Date(value).getTime());
    }, "İzleme tarihi geçerli bir tarih olmalıdır")
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
        message: "Kişisel puan 1 ile 10 arasında tam sayı olmalıdır",
    })
    .transform((value) => value ?? null);

export const archiveQuerySchema = z.object({
    genre: z.string().trim().min(1, "Tür filtresi geçersiz").optional(),
    limit: z.coerce.number().int("Sayfa boyutu 1 ile 12 arasında olmalıdır").min(1, "Sayfa boyutu 1 ile 12 arasında olmalıdır").max(12, "Sayfa boyutu 1 ile 12 arasında olmalıdır").default(12),
    minRating: z.coerce.number().int("Kişisel puan filtresi 1 ile 10 arasında olmalıdır").min(1, "Kişisel puan filtresi 1 ile 10 arasında olmalıdır").max(10, "Kişisel puan filtresi 1 ile 10 arasında olmalıdır").optional(),
    page: z.coerce.number().int("Sayfa numarası 1 veya daha büyük olmalıdır").min(1, "Sayfa numarası 1 veya daha büyük olmalıdır").default(1),
    q: z.string().trim().optional(),
    sort: z.enum(["rating", "recent", "releaseYearDesc", "title", "watchedAt"]).optional(),
    year: z.coerce.number().int("Yıl filtresi geçersiz").min(1888, "Yıl filtresi geçersiz").optional(),
});

export const archiveCreateBodySchema = z.object({
    notes: notesSchema,
    personalRating: personalRatingSchema,
    tmdbId: z.coerce.number().int("Geçerli bir film kimliği gönderilmelidir").positive("Geçerli bir film kimliği gönderilmelidir"),
    watchedAt: watchedAtSchema,
});

export const archiveUpdateBodySchema = z.object({
    notes: notesSchema,
    personalRating: personalRatingSchema,
    watchedAt: watchedAtSchema,
});

export const archiveIdParamsSchema = z.object({
    id: z.coerce.number().int("Geçerli bir arşiv kaydı kimliği gönderilmelidir").positive("Geçerli bir arşiv kaydı kimliği gönderilmelidir"),
});
