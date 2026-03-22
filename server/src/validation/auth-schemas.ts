import { z } from "zod";

export const loginBodySchema = z.object({
    email: z.string().trim().min(1, "E-posta zorunludur").email("Geçerli bir e-posta girilmelidir"),
    password: z.string().trim().min(1, "Şifre zorunludur"),
});
