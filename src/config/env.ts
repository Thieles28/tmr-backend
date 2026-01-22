import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EnvSchema = z.object({
    RESEND_API_KEY: z.string().trim().min(1),
    LEAD_TO_EMAIL: z
        .string()
        .trim()
        .min(1, "LEAD_TO_EMAIL é obrigatório")
        .regex(emailRegex, "LEAD_TO_EMAIL inválido"),

    LEAD_FROM_EMAIL: z.string().trim().optional(),
});

export const env = EnvSchema.parse(process.env);
