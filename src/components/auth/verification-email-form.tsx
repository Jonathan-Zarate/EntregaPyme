"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function VerificationEmailForm({ initialEmail }: { initialEmail: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function resend(formData: FormData) {
    setPending(true); setMessage("");
    const result = await authClient.sendVerificationEmail({ email: String(formData.get("email") ?? "").trim().toLowerCase(), callbackURL: "/dashboard" });
    setPending(false);
    setMessage(result.error ? "No pudimos enviar el correo. Intenta nuevamente." : "Enlace enviado. Revisa tambien tu carpeta de spam.");
  }

  return <form action={resend} className="space-y-5"><p className="text-sm text-slate-600">Enviaremos un enlace de un solo uso que vence en una hora.</p><label className="block text-sm font-semibold text-slate-700">Correo electronico<input name="email" type="email" defaultValue={initialEmail} required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label>{message && <p role="status" className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</p>}<button disabled={pending} className="w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{pending ? "Enviando..." : "Reenviar enlace"}</button></form>;
}
