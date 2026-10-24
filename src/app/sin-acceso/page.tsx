import Link from "next/link";

export default function ForbiddenPage() {
  return <main className="grid min-h-screen place-items-center px-5"><div className="max-w-md text-center"><p className="text-sm font-bold text-red-600">ACCESO DENEGADO</p><h1 className="mt-3 text-3xl font-bold">No tienes permiso para ingresar</h1><p className="mt-3 text-slate-600">Vuelve a tu panel o comunicate con un administrador.</p><Link href="/dashboard" className="mt-6 inline-block rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white">Ir a mi panel</Link></div></main>;
}
