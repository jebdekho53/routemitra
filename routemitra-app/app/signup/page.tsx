import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import SignupForm from "@/components/auth/SignupForm";
import GoogleButton from "@/components/auth/GoogleButton";
import { googleEnabled } from "@/auth";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <>
      <Masthead title="Account banao" />
      <main className="wrap">
        <div className="auth-card">
          <SignupForm />
          {googleEnabled && (
            <>
              <div className="auth-or">ya</div>
              <Suspense fallback={null}>
                <GoogleButton />
              </Suspense>
            </>
          )}
          <p className="auth-links">
            <Link href="/login">Pehle se account hai? Login</Link>
          </p>
          <p className="auth-hint">
            Account banane ka matlab hai tum <Link href="/terms">Terms</Link> aur{" "}
            <Link href="/privacy">Privacy Policy</Link> se agree karte ho.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
