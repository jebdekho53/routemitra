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
      <Masthead title="Create account" />
      <main className="wrap">
        <div className="auth-card">
          <SignupForm />
          {googleEnabled && (
            <>
              <div className="auth-or">or</div>
              <Suspense fallback={null}>
                <GoogleButton />
              </Suspense>
            </>
          )}
          <p className="auth-links">
            <Link href="/login">Already have an account? Sign in</Link>
          </p>
          <p className="auth-hint">
            By creating an account you agree to our <Link href="/terms">Terms</Link>{" "}
            and <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
