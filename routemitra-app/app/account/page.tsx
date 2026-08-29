import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getUserById } from "@/lib/auth/users";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import { ProfileForm, PasswordForm, DeleteAccount } from "./AccountForms";

export const metadata: Metadata = { title: "Account", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const user = await getUserById(session.user.id);
  if (!user) redirect("/login");

  return (
    <>
      <Masthead title="Account" />
      <main className="wrap">
        <div className="account-stack">
          <ProfileForm
            name={user.name ?? ""}
            email={user.email}
            verified={Boolean(user.email_verified_at)}
          />
          <PasswordForm hasPassword={Boolean(user.password_hash)} />
          <DeleteAccount />
        </div>
        <Link href="/dashboard" className="back-link">
          ← Dashboard
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
