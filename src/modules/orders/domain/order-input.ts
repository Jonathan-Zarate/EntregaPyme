import { z } from "zod";

export const packageTypes = ["DOCUMENT", "SMALL", "MEDIUM", "LARGE", "OTHER"] as const;

const optionalText = (max: number) => z.string().trim().max(max).optional().transform((value) => value || null);

export const quoteInputSchema = z.object({
  pickupDistrictId: z.string().trim().min(1),
  deliveryDistrictId: z.string().trim().min(1),
});

export const orderInputSchema = quoteInputSchema.extend({
  pickupAddress: z.string().trim().min(5).max(240),
  pickupReference: optionalText(160),
  deliveryAddress: z.string().trim().min(5).max(240),
  deliveryReference: optionalText(160),
  recipientName: z.string().trim().min(3).max(120),
  recipientPhone: z.string().trim().regex(/^\+?[0-9 ]{7,20}$/, "Ingresa un telefono valido."),
  packageType: z.enum(packageTypes),
  packageDescription: optionalText(240),
  observations: optionalText(500),
});

export type OrderInput = z.infer<typeof orderInputSchema>;
