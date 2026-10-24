import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return <AuthCard title="Registra tu negocio" description="Crea al responsable de la cuenta. Luego completarás los datos del negocio." footerText="¿Quieres realizar entregas?" footerLink="/registro-motorizado" footerLabel="Postula como motorizado"><SignUpForm /></AuthCard>;
}
