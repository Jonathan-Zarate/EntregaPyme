import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { VerificationEmailForm } from "@/components/auth/verification-email-form";

async function VerificationContent({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email = "" } = await searchParams;
  return <AuthCard title="Verifica tu correo" description="Confirma que tienes acceso al correo registrado para activar tu cuenta." footerText="¿Ya verificaste tu correo?" footerLink="/iniciar-sesion" footerLabel="Inicia sesion"><VerificationEmailForm initialEmail={email} /></AuthCard>;
}

export default function VerificationPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  return <Suspense fallback={<p className="p-8 text-slate-600">Preparando verificacion...</p>}><VerificationContent searchParams={searchParams} /></Suspense>;
}
