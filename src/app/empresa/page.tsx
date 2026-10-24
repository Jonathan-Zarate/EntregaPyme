import { Suspense } from "react";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { CompanyRegistrationForm } from "@/components/company/company-registration-form";
import { OrderCreationForm } from "@/components/orders/order-creation-form";
import { CancelOrderButton } from "@/components/orders/cancel-order-button";
import { TopUpRequestForm } from "@/components/top-ups/top-up-request-form";

async function CompanyContent() {
  const user = await requireRole("COMPANY");
  const [membership, districts] = await Promise.all([
    prisma.companyMember.findFirst({
      where: { userId: user.id },
      select: {
        role: true,
        company: {
          select: {
            legalName: true,
            tradeName: true,
            ruc: true,
            pickupAddress: true,
            districtId: true,
            district: { select: { name: true } },
            wallet: { select: { availableBalance: true, reservedBalance: true } },
            _count: { select: { orders: true } },
            topUps: { orderBy: { requestedAt: "desc" }, take: 5, select: { id: true, amount: true, status: true, operationCode: true } },
            orders: { orderBy: { createdAt: "desc" }, take: 20, select: { id: true, publicCode: true, status: true, companyPrice: true, recipientName: true, createdAt: true, pickupDistrict: { select: { name: true } }, deliveryDistrict: { select: { name: true } } } },
          },
        },
      },
    }),
    prisma.district.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!membership) {
    return <main className="mx-auto w-full max-w-4xl px-5 py-10"><p className="text-sm font-semibold text-blue-700">EntregaPyme</p><h1 className="mt-2 text-3xl font-bold">Registra tu negocio</h1><p className="mt-3 text-slate-600">Hola, {user.name}. Completa estos datos una sola vez para empezar a cotizar envios.</p><section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><CompanyRegistrationForm districts={districts} /></section></main>;
  }

  const company = membership.company;
  return <main className="mx-auto w-full max-w-6xl px-5 py-10"><div><p className="text-sm font-semibold text-blue-700">EntregaPyme</p><h1 className="mt-2 text-3xl font-bold">{company.tradeName ?? company.legalName}</h1><p className="mt-2 text-slate-600">RUC {company.ruc} · {company.district?.name ?? "Distrito pendiente"}</p></div><section className="mt-8 grid gap-4 md:grid-cols-3"><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Saldo disponible</p><p className="mt-2 text-2xl font-bold text-emerald-700">S/ {Number(company.wallet?.availableBalance ?? 0).toFixed(2)}</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Saldo reservado</p><p className="mt-2 text-2xl font-bold">S/ {Number(company.wallet?.reservedBalance ?? 0).toFixed(2)}</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Pedidos registrados</p><p className="mt-2 text-2xl font-bold">{company._count.orders}</p></article></section><section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Recargar saldo</h2><p className="mt-1 text-sm text-slate-600">Registra una transferencia. El saldo se abonara despues de la revision administrativa.</p><div className="mt-5"><TopUpRequestForm /></div>{company.topUps.length > 0 && <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-500"><tr><th className="py-2">Operacion</th><th>Monto</th><th>Estado</th></tr></thead><tbody>{company.topUps.map((topUp) => <tr key={topUp.id} className="border-t border-slate-100"><td className="py-3">{topUp.operationCode}</td><td>S/ {Number(topUp.amount).toFixed(2)}</td><td>{topUp.status}</td></tr>)}</tbody></table></div>}</section><section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Nuevo pedido</h2><p className="mt-1 text-sm text-slate-600">Primero veras la tarifa fija. El saldo solo se reserva cuando confirmas.</p><div className="mt-6"><OrderCreationForm districts={districts} defaultPickupDistrictId={company.districtId ?? ""} defaultPickupAddress={company.pickupAddress ?? ""} /></div></section><section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Historial de pedidos</h2><p className="mt-1 text-sm text-slate-600">Puedes cancelar y recuperar la reserva mientras el paquete no haya sido recogido.</p>{company.orders.length === 0 ? <p className="mt-5 text-sm text-slate-500">Aun no registraste pedidos.</p> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-4xl text-left text-sm"><thead className="text-slate-500"><tr><th className="py-3">Pedido</th><th>Trayecto</th><th>Cliente</th><th>Importe</th><th>Estado</th><th>Accion</th></tr></thead><tbody>{company.orders.map((order) => <tr key={order.id} className="border-t border-slate-100 align-top"><td className="py-4 font-semibold">{order.publicCode}</td><td>{order.pickupDistrict.name} → {order.deliveryDistrict.name}</td><td>{order.recipientName}</td><td>S/ {order.companyPrice.toFixed(2)}</td><td>{order.status}</td><td>{["DRAFT", "PENDING_ASSIGNMENT", "ACCEPTED", "HEADING_TO_PICKUP"].includes(order.status) ? <CancelOrderButton orderId={order.id} /> : <span className="text-slate-400">—</span>}</td></tr>)}</tbody></table></div>}</section></main>;
}

export default function CompanyPage() {
  return <Suspense fallback={<p className="p-8 text-slate-600">Cargando panel...</p>}><CompanyContent /></Suspense>;
}
