import { z } from "zod";

const optionalText = z.string().trim().max(160).optional().transform((value) => value || null);

export const companyInputSchema = z.object({
  ruc: z.string().trim().regex(/^20\d{9}$/, "El RUC debe tener 11 digitos y comenzar con 20."),
  legalName: z.string().trim().min(3, "Ingresa la razon social.").max(160),
  tradeName: optionalText,
  phone: z.string().trim().regex(/^\+?[0-9 ]{7,20}$/, "Ingresa un telefono valido."),
  pickupAddress: z.string().trim().min(5, "Ingresa la direccion habitual de recojo.").max(240),
  pickupReference: optionalText,
  districtId: z.string().trim().min(1, "Selecciona un distrito."),
});

export type CompanyInput = z.infer<typeof companyInputSchema>;
