import { buildVerificationEmail } from "@/modules/auth/domain/verification-email-template";

type VerificationEmail = { to: string; name: string; url: string; token: string };

export async function sendVerificationEmail(input: VerificationEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("El proveedor de correo no esta configurado.");
  const email = buildVerificationEmail(input.name, input.url);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `verify-email/${input.token}` },
    body: JSON.stringify({ from, to: [input.to], subject: email.subject, html: email.html }),
  });
  if (!response.ok) throw new Error(`Resend rechazo el correo de verificacion (${response.status}).`);
}
