"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PanelNavigation() {
  const pathname = usePathname();
  const links = pathname.startsWith("/empresa") ? [["/empresa", "Panel"], ["/empresa/pedidos", "Pedidos"], ["/empresa/movimientos", "Movimientos"]] : pathname.startsWith("/motorizado") ? [["/motorizado", "Panel"], ["/motorizado/historial", "Historial y ganancias"]] : [];
  if (links.length === 0) return null;
  return <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur md:inset-x-auto md:bottom-6 md:right-6 md:rounded-2xl md:border"><div className="mx-auto flex max-w-md justify-center gap-2">{links.map(([href, label]) => <Link key={href} href={href} className={`rounded-xl px-4 py-2 text-sm font-semibold ${pathname === href ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{label}</Link>)}</div></nav>;
}
