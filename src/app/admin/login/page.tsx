import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getSession()) redirect("/admin/dashboard");
  const { next } = await searchParams;

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* brand panel — sonar rings, per spec §C4 */}
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

      <section className="flex items-center justify-center bg-porcelain px-6 py-12">
        <LoginForm next={next ?? ""} />
      </section>
    </main>
  );
}
