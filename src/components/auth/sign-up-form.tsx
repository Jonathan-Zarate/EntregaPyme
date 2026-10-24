"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignUpForm() {
  const verificationRequired = process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED === "true";
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    const password = String(formData.get("password") ?? "");
    if (password !== String(formData.get("confirmation") ?? "")) { setError("Las contrasenas no coinciden."); return; }
    setPending(true); setError("");
    const result = await authClient.signUp.email({ name: String(formData.get("name") ?? "").trim(), email: String(formData.get("email") ?? "").trim().toLowerCase(), password });
    setPending(false);
    if (result.error) { setError("No pudimos crear la cuenta. Revisa los datos o usa otro correo."); return; }
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    router.push(verificationRequired ? `/verificar-correo?email=${encodeURIComponent(email)}` : "/dashboard"); router.refresh();
  }

  return <form action={submit} className="space-y-5">
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <label className="block text-sm font-semibold text-slate-700">Nombre completo<input name="name" autoComplete="name" required minLength={3} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label>
    <label className="block text-sm font-semibold text-slate-700">Correo corporativo<input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label>
    <label className="block text-sm font-semibold text-slate-700">Contrasena<input name="password" type="password" autoComplete="new-password" required minLength={10} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">Minimo 10 caracteres.</span></label>
    <label className="block text-sm font-semibold text-slate-700">Confirmar contrasena<input name="confirmation" type="password" autoComplete="new-password" required minLength={10} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label>
    <button disabled={pending} className="w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{pending ? "Creando cuenta..." : "Crear cuenta de empresa"}</button>
  </form>;
}
