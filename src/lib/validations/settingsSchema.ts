import * as z from "zod";

export const settingsSchema = z.object({
  operating_expenses: z
    .number()
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%"),
  provision_mora: z
    .number()
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%"),
  grace_days: z
    .number()
    .int("Debe ser un número entero")
    .min(0, "Mínimo 0 días")
    .max(90, "Máximo 90 días"),
  max_active_loans: z
    .number()
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1 préstamo")
    .max(10, "Máximo 10 préstamos"),
  min_liquidity_percent: z
    .number()
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%"),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
