import { AuthCard } from "@/components/auth/auth-card";
import { CourierSignUpForm } from "@/components/auth/courier-sign-up-form";

export default function CourierSignUpPage() {
  return <AuthCard title="Postula como motorizado" description="Registra tus datos. Podras aceptar servicios cuando un administrador apruebe tu perfil." footerText="¿Ya tienes una cuenta?" footerLink="/iniciar-sesion" footerLabel="Iniciar sesion"><CourierSignUpForm /></AuthCard>;
}
