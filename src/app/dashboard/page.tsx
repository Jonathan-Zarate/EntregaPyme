import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/authorization";

const destinations: Record<string, string> = { ADMIN: "/admin", COMPANY: "/empresa", COURIER: "/motorizado" };

async function DashboardRedirect() {
  const user = await requireCurrentUser();
  return redirect(destinations[user.role] ?? "/sin-acceso");
}

export default function DashboardPage() {
  return <Suspense fallback={<p className="p-8 text-slate-600">Preparando tu panel...</p>}><DashboardRedirect /></Suspense>;
}
