import {Router} from "express";
import {ZodError} from "zod";
import {Resend} from "resend";
import {env} from "../config/env";
import {LeadSchema} from "../validators/lead.schema";

const router = Router();
const resend = new Resend(env.RESEND_API_KEY);

router.post("/", async (req, res) => {
    try {
        const data = LeadSchema.parse(req.body);

        const from =
            env.LEAD_FROM_EMAIL ||
            "Solicitação de novos projetos <onboarding@resend.dev>";

        const text =
            `Novo lead\n\n` +
            `Nome: ${data.name}\n` +
            `Email: ${data.email}\n` +
            `Telefone: ${data.phone ?? "-"}\n\n` +
            `Mensagem:\n${data.message}\n`;
        const html = `

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Novo lead</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #e6e8ee;border-radius:12px;overflow:hidden;">
        <div style="padding:18px 20px;background:#0f172a;color:#ffffff;">
          <div style="font-size:16px;font-weight:700;">Novo lead</div>
          <div style="font-size:12px;opacity:.9;margin-top:4px;">Solicitação de novos projetos</div>
        </div>

        <div style="padding:20px;">
          <div style="margin-bottom:14px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;">Dados do contato</div>

            <div style="padding:12px;border:1px solid #e6e8ee;border-radius:10px;">
              <div style="margin:0 0 6px 0;font-size:14px;"><strong>Nome:</strong> ${escapeHtml(
            data.name
        )}</div>
              <div style="margin:0 0 6px 0;font-size:14px;"><strong>Email:</strong> ${escapeHtml(
            data.email
        )}</div>
              <div style="margin:0;font-size:14px;"><strong>Telefone:</strong> ${escapeHtml(
            data.phone ?? "-"
        )}</div>
            </div>
          </div>

          <div>
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;">Mensagem</div>
            <div style="padding:14px;border:1px solid #e6e8ee;border-radius:10px;background:#fbfbfc;white-space:pre-wrap;line-height:1.45;font-size:14px;color:#0f172a;">
${escapeHtml(data.message)}
            </div>
          </div>

          <div style="margin-top:18px;font-size:12px;color:#94a3b8;">
            Responder para: <strong>${escapeHtml(data.email)}</strong>
          </div>
        </div>
      </div>

      <div style="text-align:center;margin-top:14px;font-size:11px;color:#94a3b8;">
        Enviado via formulário do site
      </div>
    </div>
  </body>
</html>`.trim();

        const result = await resend.emails.send({
            from,
            to: env.LEAD_TO_EMAIL,
            replyTo: data.email,
            subject: `Novo lead - ${data.name}`,
            text,
            html,
        });

        if (result?.error) {
            return res.status(502).json({
                ok: false,
                error: "Email provider error",
                message: String((result as any)?.error?.message ?? result.error),
            });
        }

        return res.status(201).json({
            success: true,
            message:
                "Mensagem enviada com sucesso. Em breve nossa equipe entrará em contato.",
            requestId: result.data?.id ?? null,
        });
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json({
                ok: false,
                error: "Validation error",
                issues: err.issues.map((i) => ({
                    path: i.path.join("."),
                    message: i.message,
                })),
            });
        }

        return res.status(500).json({ok: false, error: "Failed to send lead"});
    }
});

function escapeHtml(input: string) {
    return String(input)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export default router;