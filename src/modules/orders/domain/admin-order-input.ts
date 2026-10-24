import { z } from "zod";

export const assignOrderInputSchema = z.object({
  courierId: z.string().min(1),
  comment: z.string().trim().max(300).optional(),
});

export const adminOrderQuerySchema = z.object({
  status: z.enum(["DRAFT", "PENDING_ASSIGNMENT", "ACCEPTED", "HEADING_TO_PICKUP", "PICKED_UP", "HEADING_TO_DESTINATION", "DELIVERED", "CANCELLED"]).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
