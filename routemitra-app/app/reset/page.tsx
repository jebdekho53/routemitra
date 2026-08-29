import type { Metadata } from "next";
import { Suspense } from "react";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import ResetForm from "@/components/auth/ResetForm";

export const metadata: Metadata = { title: "Naya password" };

export default function ResetPage() {
  return (
    <>
      <Masthead title="Naya password" />
      <main className="wrap">
        <div className="auth-card">
          <Suspense fallback={null}>
            <ResetForm />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
