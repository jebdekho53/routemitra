"use server";

import { revalidatePath } from "next/cache";
import { setFeedbackStatus } from "@/lib/feedback";

// These run only from the /admin page, which is gated by HTTP Basic Auth in
// proxy.ts (matcher covers /admin/:path*, including the server-action POST).

export async function resolveFeedbackAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  if (id) await setFeedbackStatus(id, "resolved");
  revalidatePath("/admin");
}

export async function reopenFeedbackAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  if (id) await setFeedbackStatus(id, "new");
  revalidatePath("/admin");
}
