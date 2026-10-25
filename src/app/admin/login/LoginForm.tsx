"use client";

import { useActionState, useState } from "react";
import Link from "next/link"; // <--- Imported Link
import { Eye, EyeOff, Lock } from "lucide-react";
import { loginAction } from "@/lib/actions/auth.actions";
import { useNow } from "@/hooks/useNow";
import type { LoginState } from "@/types";

const initial: LoginState = {};

function mmss(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  const [show, setShow] = useState(false);
  const now = useNow();

  const secondsLeft = state.lockedUntil && now ? Math.max(0, Math.ceil((Date.parse(state.lockedUntil) - now) / 1000)) : null;
  const locked = Boolean(state.lockedUntil) && (secondsLeft === null || secondsLeft > 0);

  return (
    <form action={formAction} className="w-full max-w-sm">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-ink">Welcome back</h1>
      <p className="mt-1 mb-8 text-sm text-mist">Sign in to the SAVD admin panel.</p>

      <input type="hidden" name="next" value={next} />

      <div className="mb-4">
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="input" disabled={locked} />
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="label">Password</label>
        <div className="relative">
          <input id="password" name="password" type={show ? "text" : "password"} required autoComplete="current-password" className="input pr-12" disabled={locked} />
          <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-mist hover:text-ink">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {locked ? (
        <div role="alert" className="mb-4 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink">
          <Lock className="mt-0.5 size-4 shrink-0 text-danger" />
          <p>
            Account locked. Try again in{" "}
            <strong className="font-mono">{secondsLeft === null ? "15:00" : mmss(secondsLeft)}</strong>
          </p>
        </div>
      ) : state.error ? (
        <div role="alert" className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink">
          {state.error}
          {state.attemptsLeft !== undefined ? (
            <span className="mt-1 block font-semibold">
              {state.attemptsLeft} {state.attemptsLeft === 1 ? "attempt" : "attempts"} left before this account is locked.
            </span>
          ) : null}
        </div>
      ) : null}

      <button type="submit" disabled={pending || locked} className="btn btn-primary w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>

      {/* FORGOT PASSWORD LINK */}
      <div className="mt-6 text-center">
        <Link href="/admin/forgot-password" className="text-sm font-semibold text-signal hover:text-signal-light transition-colors">
          Forgot your password?
        </Link>
      </div>
    </form>
  );
}