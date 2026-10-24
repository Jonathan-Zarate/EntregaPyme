import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

const districts = [
  ["130101", "Trujillo"],
  ["130102", "El Porvenir"],
  ["130103", "Florencia de Mora"],
  ["130105", "La Esperanza"],
  ["130107", "Huanchaco"],
  ["130111", "Victor Larco Herrera"],
] as const;

async function seedDistrictsAndRates() {
  const savedDistricts = [];
  for (const [ubigeo, name] of districts) {
    savedDistricts.push(await prisma.district.upsert({
      where: { ubigeo },
      update: { name, province: "Trujillo", department: "La Libertad", active: true },
      create: { ubigeo, name, province: "Trujillo", department: "La Libertad" },
    }));
  }

  const validFrom = new Date("2026-01-01T00:00:00.000Z");
  for (const origin of savedDistricts) {
    for (const destination of savedDistricts) {
      const companyPrice = origin.id === destination.id ? 10 : 15;
      const courierPayment = origin.id === destination.id ? 8 : 12;
      await prisma.deliveryRate.upsert({
        where: { originDistrictId_destinationDistrictId_validFrom: { originDistrictId: origin.id, destinationDistrictId: destination.id, validFrom } },
        update: { companyPrice, courierPayment, active: true, validUntil: null },
        create: { originDistrictId: origin.id, destinationDistrictId: destination.id, companyPrice, courierPayment, validFrom },
      });
    }
  }
}

async function main() {
  await seedDistrictsAndRates();

  const name = process.env.SEED_ADMIN_NAME;
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.log("Semilla omitida: configura SEED_ADMIN_NAME, SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD.");
    return;
  }

  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD debe tener al menos 12 caracteres.");
  }

  let user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (!user) {
    const created = await auth.api.signUpEmail({ body: { name, email, password } });
    user = { id: created.user.id };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN", status: "ACTIVE", banned: false, banReason: null, banExpires: null },
  });

  console.log(`Catalogo inicial preparado y administrador listo: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
