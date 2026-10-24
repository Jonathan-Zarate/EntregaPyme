import { z } from "zod";

const money = z.coerce.number().positive().max(10000).multipleOf(0.01);

export const rateInputSchema = z.object({
  originDistrictId: z.string().min(1),
  destinationDistrictId: z.string().min(1),
  companyPrice: money,
  courierPayment: money,
}).superRefine((value, context) => {
  if (value.courierPayment > value.companyPrice) context.addIssue({ code: "custom", path: ["courierPayment"], message: "El pago al motorizado no puede superar el precio." });
});

export const updateRateInputSchema = z.object({
  companyPrice: money,
  courierPayment: money,
}).superRefine((value, context) => {
  if (value.courierPayment > value.companyPrice) context.addIssue({ code: "custom", path: ["courierPayment"], message: "El pago al motorizado no puede superar el precio." });
});
