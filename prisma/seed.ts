import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

async function main() {
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

  console.log(`Administrador preparado: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
