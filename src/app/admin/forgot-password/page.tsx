import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/admin/ForgotPasswordForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Forgot Password | SAVD Admin" };

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand Panel */}
      <section className="relative flex min-h-[200px] items-center overflow-hidden bg-abyss px-8 py-10 text-porcelain lg:min-h-screen lg:px-16">
        <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
          {[0, 1.3, 2.6].map((delay) => (
            <span key={delay} className="absolute size-[28rem] animate-sonar rounded-full border border-aqua/40" style={{ animationDelay: `${delay}s` }} />
          ))}
        </div>
        <div className="relative">
          <p className="font-display text-5xl font-bold tracking-wide lg:text-7xl">
            SAVD <span className="text-lg text-aqua lg:text-2xl">▸ MES</span>
          </p>
          <p className="mt-3 max-w-sm font-serif text-lg italic text-porcelain/80">Run the competition, not the spreadsheets.</p>
        </div>
      </section>

      {/* Form Panel */}
      <section className="flex flex-col justify-center items-center bg-porcelain px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/admin/login" className="inline-flex items-center gap-2 text-sm font-semibold text-mist hover:text-ink mb-8 transition-colors">
            <ArrowLeft className="size-4" /> Back to login
          </Link>
          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  );
}