import { z } from "zod";

const cleanText = (v: unknown) =>
    (typeof v === "string" ? v : "")
        .trim()
        .replace(/[\u200B-\u200D\uFEFF]/g, "");

const cleanEmail = (v: unknown) =>
    cleanText(v).toLowerCase().replace(/\s+/g, "");

export const LeadSchema = z.object({
    name: z.preprocess(
        (v) => cleanText(v),
        z.string().trim().min(2, "Nome inválido")
    ),

    email: z.preprocess(
        (v) => cleanEmail(v),
        z
            .string()
            .min(1, "Email é obrigatório")
            .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
                message: "Email inválido",
            })
    ),

    phone: z.preprocess(
        (v) => {
            const digits = cleanText(v).replace(/\D+/g, "");
            return digits.length ? digits : undefined;
        },
        z.string().optional()
    ),

    message: z.preprocess(
        (v) => cleanText(v),
        z.string().trim().min(5, "Mensagem inválida")
    ),
});

export type LeadInput = z.infer<typeof LeadSchema>;