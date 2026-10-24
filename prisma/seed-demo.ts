import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

type DemoUser = { name?: string; email?: string; password?: string; role: "COMPANY" | "COURIER" };

async function ensureUser(input: DemoUser) {
  if (!input.name || !input.email || !input.password || input.password.length < 12) {
    throw new Error(`Faltan credenciales demo seguras para el rol ${input.role}.`);
  }
  const email = input.email.trim().toLowerCase();
  let user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    const created = await auth.api.signUpEmail({ body: { name: input.name, email, password: input.password } });
    user = { id: created.user.id };
  }
  return prisma.user.update({
    where: { id: user.id },
    data: { role: input.role, status: "ACTIVE", banned: false, banReason: null, banExpires: null },
    select: { id: true, email: true },
  });
}

async function main() {
  const companyUser = await ensureUser({
    name: process.env.DEMO_COMPANY_NAME,
    email: process.env.DEMO_COMPANY_EMAIL,
    password: process.env.DEMO_COMPANY_PASSWORD,
    role: "COMPANY",
  });
  const courierUser = await ensureUser({
    name: process.env.DEMO_COURIER_NAME,
    email: process.env.DEMO_COURIER_EMAIL,
    password: process.env.DEMO_COURIER_PASSWORD,
    role: "COURIER",
  });

  await prisma.courierProfile.upsert({
    where: { userId: courierUser.id },
    update: { approvalStatus: "APPROVED", reviewReason: null },
    create: {
      userId: courierUser.id,
      documentType: "DNI",
      documentNumber: "70000001",
      phone: "900000001",
      vehiclePlate: "DEM001",
      approvalStatus: "APPROVED",
      reviewedAt: new Date(),
    },
  });

  console.log(`Usuarios demo preparados: ${companyUser.email}, ${courierUser.email}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
