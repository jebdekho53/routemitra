// Phase 15 — input schemas (zod). Used by auth + search API routes and forms.

import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email")
  .max(200);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(200);

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
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
  // comma-separated subset of bus,train,flight — omitted means all three
  modes: z
    .string()
    .trim()
    .regex(/^(bus|train|flight)(,(bus|train|flight))*$/)
    .nullish(),
}).refine((v) => v.from.trim().toLowerCase() !== v.to.trim().toLowerCase(), {
  message: "From and To can't be the same place.",
  path: ["to"],
});

export const watchSchema = z.object({
  from: citySchema,
  to: citySchema,
});

export const feedbackKinds = ["idea", "bug", "fare", "support", "other"] as const;

export const feedbackSchema = z.object({
  kind: z.enum(feedbackKinds).catch("other"),
  message: z.string().trim().min(4, "Please add a little more detail").max(4000),
  // optional — blank string is fine, but a non-blank value must look like an email
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(200)
    .optional()
    .refine(
      (v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
      "Enter a valid email (or leave it blank)",
    ),
  page: z.string().trim().max(300).optional(),
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
