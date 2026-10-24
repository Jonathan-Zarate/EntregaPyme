import { prismaAdapter } from "@better-auth/prisma-adapter";
import { APIError } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";

import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const requireEmailVerification = process.env.EMAIL_VERIFICATION_REQUIRED === "true";

export const auth = betterAuth({
  appName: "EntregaPyme",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 10, requireEmailVerification },
  emailVerification: {
    sendOnSignUp: requireEmailVerification,
    sendOnSignIn: requireEmailVerification,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url, token }) => {
      await sendVerificationEmail({ to: user.email, name: user.name, url, token });
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "COMPANY", input: false },
      status: { type: "string", required: false, defaultValue: "ACTIVE", input: false },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { status: true, banned: true } });
          if (!user || user.status !== "ACTIVE" || user.banned) {
            throw new APIError("FORBIDDEN", { message: "Tu cuenta no se encuentra habilitada." });
          }
          return { data: session };
        },
      },
    },
  },
  advanced: { database: { joins: true } },
});
