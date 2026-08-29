"use server";

import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { parse, updateProfileSchema, changePasswordSchema } from "@/lib/validation";
import {
  getUserById,
  updateUserProfile,
  setPasswordHash,
  deleteUser,
  getUserByEmail,
} from "@/lib/auth/users";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export type State = { ok?: string; error?: string };

export async function updateProfileAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Login karo." };

  const { data, errors } = parse(updateProfileSchema, {
    name: formData.get("name") || undefined,
    email: formData.get("email") || undefined,
  });
  if (errors) return { error: Object.values(errors)[0] };

  if (data.email) {
    const clash = await getUserByEmail(data.email);
    if (clash && String(clash.id) !== session.user.id) {
      return { error: "Ye email kisi aur account se juda hai." };
    }
  }

  await updateUserProfile(session.user.id, data);
  revalidatePath("/account");
  return {
    ok: data.email
      ? "Profile update ho gaya. Naya email verify karna hoga."
      : "Profile update ho gaya.",
  };
}

export async function changePasswordAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Login karo." };

  const { data, errors } = parse(changePasswordSchema, {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (errors) return { error: Object.values(errors)[0] };

  const user = await getUserById(session.user.id);
  if (!user) return { error: "User nahi mila." };
  if (!user.password_hash) {
    return { error: "Ye account Google se bana hai — password set nahi hai." };
  }
  if (!(await verifyPassword(data.currentPassword, user.password_hash))) {
    return { error: "Current password galat hai." };
  }
  await setPasswordHash(session.user.id, await hashPassword(data.newPassword));
  return { ok: "Password badal gaya." };
}

export async function deleteAccountAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  await deleteUser(session.user.id);
  await signOut({ redirectTo: "/" });
}
