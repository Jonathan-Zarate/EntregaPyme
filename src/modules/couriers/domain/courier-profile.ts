import { z } from "zod";

export const courierProfileInputSchema = z.object({
  documentType: z.enum(["DNI", "CE"]),
  documentNumber: z.string().trim().regex(/^([0-9]{8}|[A-Za-z0-9]{9,12})$/, "Documento invalido."),
  phone: z.string().trim().regex(/^9[0-9]{8}$/, "Ingresa un celular peruano valido."),
  vehiclePlate: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{5,8}$/, "Placa invalida.").optional().or(z.literal("")),
});
