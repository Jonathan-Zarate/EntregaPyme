"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true); setError("");
    const result = await authClient.signIn.email({ email: String(formData.get("email") ?? "").trim().toLowerCase(), password: String(formData.get("password") ?? "") });
    setPending(false);
    if (result.error) { setError("No pudimos iniciar sesion. Verifica tus datos o el estado de tu cuenta."); return; }
    router.push("/dashboard"); router.refresh();
  }

  return <form action={submit} className="space-y-5">
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <label className="block text-sm font-semibold text-slate-700">Correo electronico<input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" placeholder="nombre@empresa.pe" /></label>
    <label className="block text-sm font-semibold text-slate-700">Contrasena<input name="password" type="password" autoComplete="current-password" required minLength={10} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label>
    <button disabled={pending} className="w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{pending ? "Ingresando..." : "Ingresar"}</button>
  </form>;
}
