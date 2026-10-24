import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return <AuthCard title="Iniciar sesion" description="Accede al panel correspondiente a tu rol." footerText="¿Tu negocio aun no tiene cuenta?" footerLink="/registro" footerLabel="Registrarlo"><SignInForm /></AuthCard>;
}
