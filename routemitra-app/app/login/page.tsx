import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import LoginForm from "@/components/auth/LoginForm";
import GoogleButton from "@/components/auth/GoogleButton";
import { googleEnabled } from "@/auth";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <>
      <Masthead title="Login" />
      <main className="wrap">
        <div className="auth-card">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
          {googleEnabled && (
            <>
              <div className="auth-or">or</div>
              <Suspense fallback={null}>
                <GoogleButton />
              </Suspense>
            </>
          )}
          <p className="auth-links">
            <Link href="/forgot">Forgot password?</Link>
            <Link href="/signup">Create an account</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
