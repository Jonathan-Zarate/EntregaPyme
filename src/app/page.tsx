import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#dbeafe_0,transparent_35%),linear-gradient(180deg,#fff_0%,#f5f7fb_70%)]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-bold text-slate-900"><span className="grid size-10 place-items-center rounded-xl bg-blue-700 text-white">EP</span><span>EntregaPyme</span></Link>
        <div className="flex items-center gap-3"><Link href="/iniciar-sesion" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">Iniciar sesion</Link><Link href="/registro" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Crear cuenta</Link></div>
      </nav>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:pt-24">
        <div><span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">Delivery B2B para negocios peruanos</span><h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">Tus entregas, con precio fijo y control de principio a fin.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Ingresa las direcciones, consulta la tarifa en soles y sigue cada etapa del servicio desde cualquier computadora o celular.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/registro" className="rounded-xl bg-blue-700 px-6 py-3 text-center font-semibold text-white hover:bg-blue-800">Registrar mi negocio</Link><Link href="/iniciar-sesion" className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center font-semibold text-slate-700">Ya tengo una cuenta</Link></div></div>
        <div className="rounded-3xl border border-white bg-white/90 p-6 shadow-2xl shadow-slate-900/10"><div className="flex items-center justify-between border-b border-slate-100 pb-5"><div><p className="text-sm text-slate-500">Pedido EP-00128</p><p className="mt-1 text-xl font-bold">En camino al destino</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">En curso</span></div><dl className="grid grid-cols-2 gap-4 py-6"><div className="rounded-xl bg-slate-50 p-4"><dt className="text-sm text-slate-500">Tarifa fija</dt><dd className="mt-1 text-2xl font-bold">S/ 18.00</dd></div><div className="rounded-xl bg-slate-50 p-4"><dt className="text-sm text-slate-500">Destino</dt><dd className="mt-1 font-bold">Miraflores</dd></div></dl><p className="rounded-xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-700">Pedido recogido correctamente</p></div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-20 sm:px-8 md:grid-cols-3">{[["Tarifa clara","Conoce el precio antes de confirmar."],["Saldo controlado","Revisa disponibles y reservas."],["Historial auditable","Consulta cada cambio y responsable."]].map(([title,description]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-bold">{title}</h2><p className="mt-2 text-slate-600">{description}</p></article>)}</section>
    </main>
  );
}
