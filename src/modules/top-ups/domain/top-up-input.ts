import { z } from "zod";

export const topUpRequestSchema = z.object({
  amount: z.coerce.number().min(10, "La recarga minima es S/ 10.").max(10000, "La recarga maxima es S/ 10,000."),
  operationCode: z.string().trim().min(4, "Ingresa el codigo de operacion.").max(60),
  evidenceUrl: z.union([z.url("Ingresa una URL valida."), z.literal("")]).optional().transform((value) => value || null),
});

export const topUpReviewSchema = z.object({
  reason: z.string().trim().max(300).optional().transform((value) => value || null),
});
