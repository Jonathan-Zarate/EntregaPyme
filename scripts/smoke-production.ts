export {};

type LoginUser = { email: string; password: string };

const baseUrl = process.env.SMOKE_BASE_URL ?? "https://entrega-pyme.vercel.app";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} no esta configurada.`);
  return value;
}

async function login(user: LoginUser) {
  const response = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: baseUrl },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error(`Login fallo (${response.status}).`);
  const cookies = response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";", 1)[0])
    .join("; ");
  if (!cookies) throw new Error("El login no devolvio una sesion.");
  return cookies;
}

async function api(path: string, cookie: string, init: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Origin: baseUrl,
      Cookie: cookie,
      ...init.headers,
    },
  });
  const payload = await response.json();
  if (!response.ok)
    throw new Error(
      `${path}: ${payload.error?.code ?? response.status} - ${payload.error?.message ?? "Error"}`,
    );
  return payload.data;
}

async function main() {
  const companyCookie = await login({
    email: required("DEMO_COMPANY_EMAIL"),
    password: required("DEMO_COMPANY_PASSWORD"),
  });
  const adminCookie = await login({
    email: required("SEED_ADMIN_EMAIL"),
    password: required("SEED_ADMIN_PASSWORD"),
  });
  const districts = await api("/api/districts", companyCookie);
  if (districts.length < 2)
    throw new Error("Se requieren al menos dos distritos activos.");

  let membership = await api("/api/companies/current", companyCookie);
  if (!membership) {
    await api("/api/companies/current", companyCookie, {
      method: "POST",
      body: JSON.stringify({
        ruc: "20999999991",
        legalName: "Comercial Demo Trujillo SAC",
        tradeName: "Comercial Demo",
        phone: "900000002",
        pickupAddress: "Av. Espana 100, Trujillo",
        pickupReference: "Local demo",
        districtId: districts[0].id,
      }),
    });
    membership = await api("/api/companies/current", companyCookie);
  }

  const operationCode = `SMOKE-${Date.now()}`;
  const topUp = await api("/api/top-ups", companyCookie, {
    method: "POST",
    body: JSON.stringify({ amount: 100, operationCode }),
  });
  await api(`/api/admin/top-ups/${topUp.id}/approve`, adminCookie, {
    method: "POST",
    headers: { "Idempotency-Key": `approve-${topUp.id}` },
    body: "{}",
  });

  const orderBody = {
    pickupDistrictId: districts[0].id,
    pickupAddress: "Av. Espana 100, Trujillo",
    pickupReference: "Local demo",
    deliveryDistrictId: districts[1].id,
    deliveryAddress: "Av. America Norte 200",
    deliveryReference: "Puerta principal",
    recipientName: "Cliente Demo",
    recipientPhone: "900000003",
    packageType: "SMALL",
    packageDescription: "Paquete de prueba",
    observations: "Smoke test automatizado",
  };
  const quote = await api("/api/quotes", companyCookie, {
    method: "POST",
    body: JSON.stringify(orderBody),
  });
  const order = await api("/api/orders", companyCookie, {
    method: "POST",
    body: JSON.stringify(orderBody),
  });
  const confirmed = await api(
    `/api/orders/${order.id}/confirm`,
    companyCookie,
    {
      method: "POST",
      headers: { "Idempotency-Key": `confirm-${order.id}` },
      body: "{}",
    },
  );
  const after = await api("/api/companies/current", companyCookie);

  console.log(
    JSON.stringify(
      {
        loginEmpresa: "OK",
        loginAdmin: "OK",
        empresa: membership.company.legalName,
        recarga: topUp.id,
        cotizacion: quote.price,
        pedido: confirmed.publicCode,
        estado: confirmed.status,
        saldoDisponible: after.company.wallet.availableBalance,
        saldoReservado: after.company.wallet.reservedBalance,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
