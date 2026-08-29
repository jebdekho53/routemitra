import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import ForgotForm from "@/components/auth/ForgotForm";

export const metadata: Metadata = { title: "Password reset" };

export default function ForgotPage() {
  return (
    <>
      <Masthead title="Password reset" />
      <main className="wrap">
        <div className="auth-card">
          <ForgotForm />
          <p className="auth-links">
            <Link href="/login">Login par wapas</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
