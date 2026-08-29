// Phase 15 — input schemas (zod). Used by auth + search API routes and forms.

import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Sahi email daalo")
  .max(200);

export const passwordSchema = z
  .string()
  .min(8, "Password kam se kam 8 characters")
  .max(200);

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Naam chahiye").max(80),
  email: emailSchema,
  password: passwordSchema,
  turnstileToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
});

export const forgotSchema = z.object({ email: emailSchema });

export const resetSchema = z.object({
  token: z.string().min(10).max(400),
  password: passwordSchema,
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  email: emailSchema.optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: passwordSchema,
});

export const citySchema = z.string().trim().min(1).max(60);

export const searchQuerySchema = z.object({
  from: citySchema,
  to: citySchema,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish(),
  origin: z.string().trim().max(200).nullish(),
  destination: z.string().trim().max(200).nullish(),
});

export const watchSchema = z.object({
  from: citySchema,
  to: citySchema,
});

// Small helper: parse and return either data or a flat field->message map.
export function parse<T>(
  schema: z.ZodType<T>,
  input: unknown,
): { data: T; errors: null } | { data: null; errors: Record<string, string> } {
  const r = schema.safeParse(input);
  if (r.success) return { data: r.data, errors: null };
  const errors: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const key = issue.path.join(".") || "_";
    if (!errors[key]) errors[key] = issue.message;
  }
  return { data: null, errors };
}
