"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function CourierSignUpForm() {
  const verificationRequired = process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED === "true";
  const session = authClient.useSession();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const inputClass = "mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal";

  async function submit(formData: FormData) {
    setPending(true); setError("");
    if (!session.data) {
      const password = String(formData.get("password") ?? "");
      if (password !== String(formData.get("confirmation") ?? "")) { setPending(false); setError("Las contrasenas no coinciden."); return; }
      const email = String(formData.get("email") ?? "").trim().toLowerCase();
      const signUp = await authClient.signUp.email({ name: String(formData.get("name") ?? "").trim(), email, password });
      if (signUp.error) { setPending(false); setError("No pudimos crear la cuenta. Revisa los datos o inicia sesion si ya te registraste."); return; }
      if (verificationRequired) { setPending(false); router.push(`/verificar-correo?email=${encodeURIComponent(email)}`); return; }
    }
    const profile = await fetch("/api/courier/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentType: formData.get("documentType"), documentNumber: formData.get("documentNumber"), phone: formData.get("phone"), vehiclePlate: formData.get("vehiclePlate") }) });
    const body = await profile.json().catch(() => null);
    setPending(false);
    if (!profile.ok) { setError(body?.error?.message ?? "La cuenta fue creada, pero no pudimos completar el perfil."); return; }
    router.push("/motorizado"); router.refresh();
  }

  return <form action={submit} className="space-y-4">{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}{session.data ? <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">Completaras la postulacion de {session.data.user.email}.</p> : <><label className="block text-sm font-semibold text-slate-700">Nombre completo<input name="name" required minLength={3} autoComplete="name" className={inputClass} /></label><label className="block text-sm font-semibold text-slate-700">Correo electronico<input name="email" type="email" required autoComplete="email" className={inputClass} /></label></>}<div className="grid grid-cols-3 gap-3"><label className="text-sm font-semibold text-slate-700">Documento<select name="documentType" className={inputClass}><option value="DNI">DNI</option><option value="CE">CE</option></select></label><label className="col-span-2 text-sm font-semibold text-slate-700">Numero<input name="documentNumber" required className={inputClass} /></label></div><label className="block text-sm font-semibold text-slate-700">Celular<input name="phone" type="tel" required placeholder="987654321" className={inputClass} /></label><label className="block text-sm font-semibold text-slate-700">Placa del vehiculo (opcional)<input name="vehiclePlate" placeholder="ABC-123" className={inputClass} /></label>{!session.data && <><label className="block text-sm font-semibold text-slate-700">Contrasena<input name="password" type="password" required minLength={10} autoComplete="new-password" className={inputClass} /></label><label className="block text-sm font-semibold text-slate-700">Confirmar contrasena<input name="confirmation" type="password" required minLength={10} autoComplete="new-password" className={inputClass} /></label></>}<button disabled={pending || session.isPending} className="w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{pending ? "Registrando..." : "Enviar solicitud"}</button><p className="text-xs leading-5 text-slate-500">Tu perfil quedara pendiente hasta que un administrador revise los datos.</p></form>;
}
