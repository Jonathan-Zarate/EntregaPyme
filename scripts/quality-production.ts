export {};

type Credentials = { email: string; password: string };
type Result<T = unknown> = { status: number; body: T; durationMs: number };

const baseUrl =
  process.env.QUALITY_BASE_URL ?? "https://entrega-pyme.vercel.app";
const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} no esta configurada.`);
  return value;
};

async function login(input: Credentials) {
  const response = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: baseUrl },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(`Login fallo (${response.status}).`);
  const cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(";", 1)[0])
    .join("; ");
  if (!cookie) throw new Error("El login no devolvio sesion.");
  return cookie;
}

async function request<T = unknown>(
  path: string,
  cookie?: string,
  init: RequestInit = {},
): Promise<Result<T>> {
  const start = performance.now();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Origin: baseUrl,
      ...(cookie ? { Cookie: cookie } : {}),
      ...init.headers,
    },
  });
  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
    durationMs: performance.now() - start,
  };
}

function expectStatus(
  label: string,
  result: Result,
  expected: number | number[],
) {
  const values = Array.isArray(expected) ? expected : [expected];
  if (!values.includes(result.status))
    throw new Error(
      `${label}: esperado ${values.join("/")}, recibido ${result.status}.`,
    );
}

const json = (
  body: unknown,
  headers: Record<string, string> = {},
): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify(body),
});
const percentile = (values: number[], p: number) =>
  [...values].sort((a, b) => a - b)[Math.ceil(values.length * p) - 1];

async function main() {
  const [company, courier, admin] = await Promise.all([
    login({
      email: required("DEMO_COMPANY_EMAIL"),
      password: required("DEMO_COMPANY_PASSWORD"),
    }),
    login({
      email: required("DEMO_COURIER_EMAIL"),
      password: required("DEMO_COURIER_PASSWORD"),
    }),
    login({
      email: required("SEED_ADMIN_EMAIL"),
      password: required("SEED_ADMIN_PASSWORD"),
    }),
  ]);

  const authorization = await Promise.all([
    request("/api/admin/reports/summary"),
    request("/api/admin/reports/summary", company),
    request("/api/wallet", courier),
    request("/api/wallet", admin),
    request("/api/wallet/transactions?limit=101", company),
  ]);
  expectStatus("admin anonimo", authorization[0], 401);
  expectStatus("empresa en admin", authorization[1], 403);
  expectStatus("motorizado en billetera", authorization[2], 403);
  expectStatus("admin en billetera", authorization[3], 403);
  expectStatus("limite excesivo", authorization[4], 422);

  const districts = (
    await request<{ data: { id: string }[] }>("/api/districts", company)
  ).body.data;
  const orderInput = {
    pickupDistrictId: districts[0].id,
    pickupAddress: "Recojo controlado de calidad",
    pickupReference: "QUALITY",
    deliveryDistrictId: districts[1].id,
    deliveryAddress: "Entrega controlada de calidad",
    deliveryReference: "QUALITY",
    recipientName: "Cliente Quality Demo",
    recipientPhone: "900000003",
    packageType: "SMALL",
    packageDescription: "Paquete de concurrencia",
    observations: "PRUEBA CONCURRENCIA REVERSIBLE",
  };
  const created = await request<{ data: { id: string } }>(
    "/api/orders",
    company,
    json(orderInput),
  );
  expectStatus("crear pedido", created, 201);
  const orderId = created.body.data.id;
  const confirmed = await request<{ data: { publicCode: string } }>(
    `/api/orders/${orderId}/confirm`,
    company,
    json({}, { "Idempotency-Key": `quality-confirm-${orderId}` }),
  );
  expectStatus("confirmar pedido", confirmed, 200);
  const couriers = await request<{
    data: { id: string; approvalStatus: string }[];
  }>("/api/admin/couriers", admin);
  expectStatus("listar motorizados", couriers, 200);
  const approved = couriers.body.data.find(
    (item) => item.approvalStatus === "APPROVED",
  );
  if (!approved) throw new Error("No existe un motorizado aprobado.");

  const race = await Promise.all([
    request(`/api/orders/${orderId}/accept`, courier, json({})),
    request(
      `/api/admin/orders/${orderId}/assign`,
      admin,
      json({ courierId: approved.id }),
    ),
  ]);
  const raceStatuses = race.map((item) => item.status).sort();
  if (raceStatuses[0] !== 200 || raceStatuses[1] !== 409)
    throw new Error(`Concurrencia inesperada: ${raceStatuses.join(",")}.`);
  const cancelled = await request<{ data: { status: string } }>(
    `/api/orders/${orderId}/cancel`,
    company,
    json(
      { reason: "Cierre reversible de prueba de calidad" },
      { "Idempotency-Key": `quality-cancel-${orderId}` },
    ),
  );
  expectStatus("cancelar y liberar", cancelled, 200);

  const loadResults: Result[] = [];
  for (let round = 0; round < 10; round += 1)
    loadResults.push(
      ...(await Promise.all(
        Array.from({ length: 10 }, () =>
          request("/api/courier/earnings", courier),
        ),
      )),
    );
  const errors = loadResults.filter((item) => item.status !== 200);
  if (errors.length)
    throw new Error(`Carga moderada produjo ${errors.length} errores.`);
  const timings = loadResults.map((item) => item.durationMs);
  const p50Ms = Math.round(percentile(timings, 0.5));
  const p95Ms = Math.round(percentile(timings, 0.95));
  const maxMs = Math.round(Math.max(...timings));
  if (p95Ms >= 3000 || maxMs >= 5000)
    throw new Error(
      `Latencia fuera del umbral: p95=${p95Ms}ms, max=${maxMs}ms.`,
    );

  console.log(
    JSON.stringify(
      {
        authorization: {
          anonymousAdmin: 401,
          companyAdmin: 403,
          courierWallet: 403,
          adminWallet: 403,
          excessiveLimit: 422,
        },
        concurrency: {
          order: confirmed.body.data.publicCode,
          outcomes: race.map((item) => item.status),
          finalStatus: cancelled.body.data.status,
          balanceReleased: true,
        },
        load: {
          requests: loadResults.length,
          concurrency: 10,
          errors: errors.length,
          p50Ms,
          p95Ms,
          maxMs,
          thresholds: { p95BelowMs: 3000, maxBelowMs: 5000 },
        },
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
