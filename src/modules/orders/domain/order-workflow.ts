import { z } from "zod";

export const courierOrderStatuses = ["HEADING_TO_PICKUP", "PICKED_UP", "HEADING_TO_DESTINATION", "DELIVERED"] as const;

export const orderStatusInputSchema = z.object({
  toStatus: z.enum(courierOrderStatuses),
  comment: z.string().trim().max(300).optional(),
});

export const cancelOrderInputSchema = z.object({
  reason: z.string().trim().min(5).max(300),
});

export const deliveryEvidenceInputSchema = z.object({
  type: z.enum(["PHOTO", "COMMENT"]),
  url: z.url().max(1000).optional(),
  comment: z.string().trim().max(500).optional(),
}).superRefine((value, context) => {
  if (value.type === "PHOTO" && !value.url) context.addIssue({ code: "custom", path: ["url"], message: "La fotografia requiere una URL valida." });
  if (value.type === "COMMENT" && !value.comment) context.addIssue({ code: "custom", path: ["comment"], message: "Escribe un comentario de entrega." });
});

const nextStatus = {
  ACCEPTED: "HEADING_TO_PICKUP",
  HEADING_TO_PICKUP: "PICKED_UP",
  PICKED_UP: "HEADING_TO_DESTINATION",
  HEADING_TO_DESTINATION: "DELIVERED",
} as const;

export function isValidCourierTransition(fromStatus: string, toStatus: string) {
  return nextStatus[fromStatus as keyof typeof nextStatus] === toStatus;
}

export function getNextCourierStatus(status: string) {
  return nextStatus[status as keyof typeof nextStatus] ?? null;
}

export function canCompanyCancel(status: string) {
  return ["DRAFT", "PENDING_ASSIGNMENT", "ACCEPTED", "HEADING_TO_PICKUP"].includes(status);
}
