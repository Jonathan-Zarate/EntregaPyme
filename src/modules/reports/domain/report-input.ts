import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const reportQuerySchema = z.object({ from: dateSchema.optional(), to: dateSchema.optional() }).superRefine((value, context) => {
  if (value.from && value.to && value.from > value.to) context.addIssue({ code: "custom", message: "La fecha inicial no puede superar la final." });
});

export function reportRange(input: z.infer<typeof reportQuerySchema>) {
  return { ...(input.from ? { gte: new Date(`${input.from}T00:00:00-05:00`) } : {}), ...(input.to ? { lte: new Date(`${input.to}T23:59:59.999-05:00`) } : {}) };
}

export function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
