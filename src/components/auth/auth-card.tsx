import type { ReactNode } from "react";
import Link from "next/link";

type Props = { title: string; description: string; children: ReactNode; footerText: string; footerLink: string; footerLabel: string };

export function AuthCard({ title, description, children, footerText, footerLink, footerLabel }: Props) {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#dbeafe_0,transparent_38%),#f5f7fb] px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
        <Link href="/" className="mb-8 flex items-center gap-3 font-bold"><span className="grid size-10 place-items-center rounded-xl bg-blue-700 text-white">EP</span>EntregaPyme</Link>
        <h1 className="text-2xl font-bold">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-7">{children}</div>
        <p className="mt-7 text-center text-sm text-slate-600">{footerText} <Link href={footerLink} className="font-semibold text-blue-700">{footerLabel}</Link></p>
      </section>
    </main>
  );
}
