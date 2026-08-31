"use server";

import { revalidatePath } from "next/cache";
import { setFeedbackStatus } from "@/lib/feedback";

// Run only from /admin/*, which is gated by HTTP Basic Auth in proxy.ts
// (matcher covers /admin/:path*, including these server-action POSTs).

export async function resolveFeedbackAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  if (id) await setFeedbackStatus(id, "resolved");
  revalidatePath("/admin", "layout");
}

export async function reopenFeedbackAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  if (id) await setFeedbackStatus(id, "new");
  revalidatePath("/admin", "layout");
}
