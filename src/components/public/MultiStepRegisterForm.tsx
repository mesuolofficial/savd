"use client";

import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { RegistrationActionState } from "@/lib/actions/registration.actions";
import { MemberRepeater } from "./MemberRepeater";

export type UniversityOption = { id: string; name: string };

export type CompetitionSummary = {
  slug: string;
  title: string;
  minTeamSize: number;
  maxTeamSize: number;
  registrationDeadline: string;
  venue: string | null;
};

type Props = {
  competition: CompetitionSummary;
  universities: UniversityOption[];
  action: (prev: RegistrationActionState, fd: FormData) => Promise<RegistrationActionState>;
};

type Step = 1 | 2 | 3;
type Issue = { label: string; message: string; step: Step; el?: HTMLInputElement };
type Modal =
  | { kind: "closed" }
  | { kind: "loading" }
  | { kind: "success"; teamName: string; redirectTo: string }
  | { kind: "error"; title: string; message?: string; issues: Issue[] };

const STEP1_FIELDS = ["teamName", "leaderName", "leaderEmail", "leaderWhatsapp", "leaderSapId", "leaderCnic", "leaderDepartment", "leaderUniversityId", "leaderUniversityText", "leaderSociety", "referralCode"];
const STEP3_FIELDS = ["consentTransactionalSms", "consentMarketingSms", "consentTerms"];

const FIELD_LABELS: Record<string, string> = {
  teamName: "Team name",
  leaderName: "Leader full name",
  leaderEmail: "Leader email",
  leaderWhatsapp: "WhatsApp number",
  leaderSapId: "Leader student ID",
  leaderCnic: "Leader CNIC",
  leaderDepartment: "Leader department",
  leaderUniversityId: "University",
  leaderUniversityText: "University / Institution",
  leaderSociety: "Society",
  referralCode: "Referral code",
  consentTransactionalSms: "Transactional messages consent",
  consentMarketingSms: "Updates consent",
  consentTerms: "Terms & Privacy consent",
};
const MEMBER_LABELS: Record<string, string> = {
  name: "Full name",
  email: "Email",
  phone: "Phone",
  sapId: "Student ID",
  cnic: "CNIC",
  department: "Department",
};

/** Accepts both "members.0.cnic" (server) and "member.0.cnic" (input name). */
function labelFor(key: string): string {
  const m = key.match(/^members?\.(\d+)\.(\w+)$/);
  if (m) return `Member ${Number(m[1]) + 1} – ${MEMBER_LABELS[m[2]] ?? m[2]}`;
  return FIELD_LABELS[key] ?? key;
}

function stepFor(key: string): Step {
  if (/^members?\./.test(key)) return 2;
  if (STEP3_FIELDS.includes(key)) return 3;
  return 1;
}

const formatCnic = (val: string) => {
  const digits = val.replace(/\D/g, "").slice(0, 13);
  if (digits.length > 12) return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
};

export function MultiStepRegisterForm({ competition, universities, action }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  // A network drop / server crash must never leave the button dead: always return a state.
  const safeAction = async (prev: RegistrationActionState, fd: FormData): Promise<RegistrationActionState> => {
    try {
      return await action(prev, fd);
    } catch (err) {
      console.error("[register] action failed:", err);
      return { error: "We couldn't reach the server. Check your internet connection and try again. Your details are still filled in." };
    }
  };

  const [state, formAction, pending] = useActionState(safeAction, {} as RegistrationActionState);
  const [step, setStep] = useState<Step>(1);
  const [modal, setModal] = useState<Modal>({ kind: "closed" });

  const [uniSearch, setUniSearch] = useState("");
  const [uniId, setUniId] = useState("");

  const e = state?.fieldErrors ?? {};

  const [refCode, setRefCode] = useState("");
  const [refStatus, setRefStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [refName, setRefName] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const urlRef = searchParams.get("ref")?.replace(/[^a-zA-Z0-9-]/g, "");
    if (urlRef) {
      const formatted = urlRef.toUpperCase();
      setRefCode(formatted);
      checkReferral(formatted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const checkReferral = (code: string) => {
    if (!code.trim()) {
      setRefStatus("idle");
      setRefName("");
      return;
    }
    setRefStatus("checking");
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/referrals/check?code=${encodeURIComponent(code)}`);
        const data = await res.json();
        if (data.valid) {
          setRefStatus("valid");
          setRefName(data.name);
        } else {
          setRefStatus("invalid");
          setRefName("");
        }
      } catch {
        setRefStatus("invalid");
      }
    }, 500);
  };

  const handleRefChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const val = ev.target.value.toUpperCase();
    setRefCode(val);
    checkReferral(val);
  };

  const handleUniChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const val = ev.target.value;
    setUniSearch(val);
    const trimmed = val.trim().toLowerCase();
    const match = universities.find((u) => u.name.toLowerCase() === trimmed);
    setUniId(match ? match.id : "other");
  };

  // ---------- server result -> modal ----------
  useEffect(() => {
    if (!state?.success && !state?.error) return;

    if (state.success && state.redirectTo) {
      setModal({ kind: "success", teamName: state.teamName ?? "", redirectTo: state.redirectTo });
      const t = setTimeout(() => router.push(state.redirectTo!), 2500);
      return () => clearTimeout(t);
    }

    const issues: Issue[] = Object.entries(state.fieldErrors ?? {}).map(([k, msg]) => ({
      label: labelFor(k),
      message: msg,
      step: stepFor(k),
    }));
    setModal({
      kind: "error",
      title: "Registration not submitted",
      message: state.error ?? "Something went wrong.",
      issues,
    });
    if (issues.length) setStep(issues[0].step);
  }, [state, router]);

  const maxMembers = Math.max(0, competition.maxTeamSize - 1);
  const minMembers = Math.max(0, competition.minTeamSize - 1);

  // ---------- client-side validation (works across hidden steps) ----------
  const stepInputs = (n: Step) =>
    Array.from(formRef.current?.querySelectorAll<HTMLInputElement>(`#step-${n} input`) ?? []);

  const goNext = (from: 1 | 2) => {
    for (const el of stepInputs(from)) {
      if (!el.checkValidity()) {
        el.reportValidity();
        return;
      }
    }
    setStep((from + 1) as Step);
  };

  const collectIssues = (): Issue[] => {
    const issues: Issue[] = [];
    for (const n of [1, 2, 3] as const) {
      for (const el of stepInputs(n)) {
        if (el.name && !el.checkValidity()) {
          issues.push({
            label: labelFor(el.name),
            message: el.type === "checkbox" ? "This must be accepted to continue." : el.validationMessage || "Invalid value.",
            step: n,
            el,
          });
        }
      }
    }
    return issues;
  };

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault(); // stops React 19's automatic form reset
    if (pending || modal.kind === "loading") return;

    // Enter key on step 1/2 should behave like "Next", not "Submit".
    if (step !== 3) {
      goNext(step as 1 | 2);
      return;
    }

    const issues = collectIssues();
    if (issues.length) {
      setModal({
        kind: "error",
        title: "Some details need fixing",
        message: "Fix the fields below, then submit again.",
        issues,
      });
      setStep(issues[0].step);
      return;
    }

    setModal({ kind: "loading" });
    const fd = new FormData(ev.currentTarget);
    startTransition(() => formAction(fd));
  };

  const closeModalAndFix = () => {
    const first = modal.kind === "error" ? modal.issues[0] : undefined;
    setModal({ kind: "closed" });
    if (first) {
      setStep(first.step);
      if (first.el) setTimeout(() => first.el?.reportValidity(), 60);
    }
  };

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} noValidate={false} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10 items-start">
        <div className="min-w-0">
          <div className="mb-6 flex gap-2">
            {([1, 2, 3] as const).map((n) => (
              <div key={n} className={`flex-1 py-2 px-3 rounded-lg text-center text-xs font-bold tracking-wider uppercase ${step >= n ? "bg-[#226192] text-white" : "bg-[#d8d2c6] text-[#14202b]"}`}>
                {n}. {n === 1 ? "Team & Leader" : n === 2 ? "Members" : "Consent"}
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          <div id="step-1" style={{ display: step === 1 ? "block" : "none" }}>
            <h2 className="text-2xl font-bold mb-4">Team &amp; leader</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="teamName" className="label">Team name *</label>
                <input id="teamName" name="teamName" className="input" required maxLength={120} />
                {e.teamName ? <p className="text-xs text-red-600 mt-1">{e.teamName}</p> : null}
              </div>
              <div>
                <label htmlFor="leaderName" className="label">Leader full name *</label>
                <input id="leaderName" name="leaderName" className="input" required minLength={2} />
                {e.leaderName ? <p className="text-xs text-red-600 mt-1">{e.leaderName}</p> : null}
              </div>
              <div>
                <label htmlFor="leaderEmail" className="label">Leader email *</label>
                <input id="leaderEmail" name="leaderEmail" type="email" className="input" required />
                {e.leaderEmail ? <p className="text-xs text-red-600 mt-1">{e.leaderEmail}</p> : null}
              </div>
              <div>
                <label htmlFor="leaderWhatsapp" className="label">WhatsApp number *</label>
                <input id="leaderWhatsapp" name="leaderWhatsapp" type="tel" className="input" required minLength={7} maxLength={20} />
                {e.leaderWhatsapp ? <p className="text-xs text-red-600 mt-1">{e.leaderWhatsapp}</p> : null}
              </div>
              <div>
                <label htmlFor="leaderSapId" className="label">Student ID *</label>
                <input id="leaderSapId" name="leaderSapId" className="input" required minLength={2} />
                {e.leaderSapId ? <p className="text-xs text-red-600 mt-1">{e.leaderSapId}</p> : null}
              </div>

              <div>
                <label htmlFor="leaderCnic" className="label">CNIC *</label>
                <input
                  id="leaderCnic"
                  name="leaderCnic"
                  className="input"
                  placeholder="12345-1234567-1"
                  required
                  maxLength={15}
                  pattern="\d{5}-\d{7}-\d"
                  title="Format: 12345-1234567-1"
                  inputMode="numeric"
                  onChange={(ev) => {
                    ev.target.value = formatCnic(ev.target.value);
                  }}
                />
                {e.leaderCnic ? <p className="text-xs text-red-600 mt-1">{e.leaderCnic}</p> : null}
              </div>

              <div>
                <label htmlFor="leaderDepartment" className="label">Department *</label>
                <input id="leaderDepartment" name="leaderDepartment" className="input" required minLength={2} />
                {e.leaderDepartment ? <p className="text-xs text-red-600 mt-1">{e.leaderDepartment}</p> : null}
              </div>

              <div>
                <label htmlFor="leaderUniversityText" className="label">University / Institution *</label>
                <input
                  list="universities-list"
                  id="leaderUniversityText"
                  name="leaderUniversityText"
                  className="input"
                  placeholder="Type to search..."
                  required
                  value={uniSearch}
                  onChange={handleUniChange}
                />
                <datalist id="universities-list">
                  {universities.map((u) => (
                    <option key={u.id} value={u.name} />
                  ))}
                </datalist>
                <input type="hidden" name="leaderUniversityId" value={uniId} />

                <p className="text-xs text-mist mt-1">Not in the list? Just type your institution&apos;s full name.</p>

                {e.leaderUniversityId ? <p className="text-xs text-red-600 mt-1">{e.leaderUniversityId}</p> : null}
                {e.leaderUniversityText ? <p className="text-xs text-red-600 mt-1">{e.leaderUniversityText}</p> : null}
              </div>

              <div>
                <label htmlFor="leaderSociety" className="label">Society (optional)</label>
                <input id="leaderSociety" name="leaderSociety" className="input" />
              </div>
              <div className="sm:col-span-2 mt-2">
                <label htmlFor="referralCode" className="label">Referral Code (optional)</label>
                <input
                  id="referralCode"
                  name="referralCode"
                  className="input"
                  value={refCode}
                  onChange={handleRefChange}
                  placeholder="e.g. PUCIT-IEEE"
                  readOnly={!!searchParams.get("ref")}
                  style={{ borderColor: refStatus === "valid" ? "#1f9d6b" : refStatus === "invalid" ? "#d64545" : undefined }}
                />
                {refStatus === "checking" && <p className="text-xs text-mist mt-1">Checking code...</p>}
                {refStatus === "valid" && <p className="text-xs text-[#1f9d6b] font-semibold mt-1">✓ Referred by {refName}</p>}
                {refStatus === "invalid" && <p className="text-xs text-[#d64545] font-semibold mt-1">✖ Invalid or unapproved referral code</p>}
                {refStatus === "idle" && <p className="text-xs text-mist mt-1">Leave blank if you weren&apos;t referred by a partner.</p>}
                {e.referralCode && <p className="text-xs text-red-600 mt-1">{e.referralCode}</p>}
              </div>
            </div>
            <div className="mt-6">
              <button type="button" className="btn b1" onClick={() => goNext(1)}>Next →</button>
            </div>
          </div>

          {/* STEP 2 */}
          <div id="step-2" style={{ display: step === 2 ? "block" : "none" }}>
            <h2 className="text-2xl font-bold mb-2">Additional members</h2>
            <p className="mb-4 text-[#5d6d7a] text-sm">
              Team total must be <strong>{competition.minTeamSize}–{competition.maxTeamSize}</strong> including you (the leader).
              {maxMembers === 0
                ? " This is a solo competition. No additional members needed."
                : minMembers === 0
                  ? ` You can register alone, or add up to ${maxMembers} more.`
                  : ` Add at least ${minMembers} and up to ${maxMembers} more.`}
            </p>
            {maxMembers > 0 ? <MemberRepeater maxMembers={maxMembers} minMembers={minMembers} errors={e} /> : null}
            <div className="mt-6 flex gap-3">
              <button type="button" className="btn b2" onClick={() => setStep(1)} style={{ borderColor: "var(--line)", color: "var(--ink)" }}>← Back</button>
              <button type="button" className="btn b1" onClick={() => goNext(2)}>Next →</button>
            </div>
          </div>

          {/* STEP 3 */}
          <div id="step-3" style={{ display: step === 3 ? "block" : "none" }}>
            <h2 className="text-2xl font-bold mb-4">Consent &amp; submit</h2>
            <div className="grid gap-3 mb-5">
              <label className="flex gap-2 items-start text-sm">
                <input type="checkbox" name="consentTransactionalSms" className="mt-1" required />
                <span>I agree to receive transactional messages about my team (required)</span>
              </label>
              {e.consentTransactionalSms ? <p className="text-xs text-red-600">{e.consentTransactionalSms}</p> : null}
              <label className="flex gap-2 items-start text-sm">
                <input type="checkbox" name="consentMarketingSms" className="mt-1" required />
                <span>I agree to receive updates from SAVD (required)</span>
              </label>
              {e.consentMarketingSms ? <p className="text-xs text-red-600">{e.consentMarketingSms}</p> : null}
              <label className="flex gap-2 items-start text-sm">
                <input type="checkbox" name="consentTerms" className="mt-1" required />
                <span>I accept the Terms of Service and Privacy Policy (required)</span>
              </label>
              {e.consentTerms ? <p className="text-xs text-red-600">{e.consentTerms}</p> : null}
            </div>
            <p className="mb-5 text-sm text-[#5d6d7a]">
              On submit we&apos;ll email the leader and every member a confirmation. Your registration will be marked <strong>Pending review</strong> until the organizers approve it.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button type="button" className="btn b2" onClick={() => setStep(2)} style={{ borderColor: "var(--line)", color: "var(--ink)" }}>← Back</button>
              <button type="submit" className="btn b1" disabled={pending || modal.kind === "loading"}>
                {pending ? "Submitting…" : "Submit registration"}
              </button>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-[90px] bg-[#0f2f4b] text-white rounded-[20px] p-6">
          <p className="ey">Registration</p>
          <h3 className="text-[22px] font-bold mt-2 mb-4">{competition.title}</h3>
          <dl className="grid gap-2.5 text-sm">
            <div>
              <dt className="text-[11px] font-semibold tracking-widest uppercase text-[#8ec1e8]">Team size</dt>
              <dd className="m-0">{competition.minTeamSize}–{competition.maxTeamSize}</dd>
            </div>
            {competition.venue ? (
              <div>
                <dt className="text-[11px] font-semibold tracking-widest uppercase text-[#8ec1e8]">Venue</dt>
                <dd className="m-0">{competition.venue}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-[11px] font-semibold tracking-widest uppercase text-[#8ec1e8]">Deadline</dt>
              <dd className="m-0">{competition.registrationDeadline}</dd>
            </div>
          </dl>
        </aside>
      </form>

      <StatusModal
        modal={modal}
        onFix={closeModalAndFix}
        onClose={() => setModal({ kind: "closed" })}
        onContinue={() => modal.kind === "success" && router.push(modal.redirectTo)}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */

function StatusModal({
  modal,
  onFix,
  onClose,
  onContinue,
}: {
  modal: Modal;
  onFix: () => void;
  onClose: () => void;
  onContinue: () => void;
}) {
  // Escape closes the error dialog only (never the loading one).
  useEffect(() => {
    if (modal.kind !== "error") return;
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal.kind, onClose]);

  if (modal.kind === "closed") return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: "rgba(10,28,45,0.72)" }}
    >
      <div className="w-full max-w-md rounded-2xl bg-[#faf7f0] p-7 shadow-2xl" style={{ maxHeight: "85vh", overflowY: "auto" }}>
        {modal.kind === "loading" && (
          <div className="text-center py-4">
            <div className="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-[#d8d2c6] border-t-[#226192] animate-spin" />
            <h3 className="text-xl font-bold mb-2">Submitting your registration…</h3>
            <p className="text-sm text-[#5d6d7a]">Please don&apos;t close or refresh this page.</p>
          </div>
        )}

        {modal.kind === "success" && (
          <div className="text-center py-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1f9d6b] text-3xl text-white">✓</div>
            <h3 className="text-xl font-bold mb-2">Registration submitted</h3>
            <p className="text-sm text-[#5d6d7a] mb-1">
              {modal.teamName ? <>Team <strong>{modal.teamName}</strong> is now </> : "Your team is now "}
              <strong>pending review</strong>.
            </p>
            <p className="text-sm text-[#5d6d7a] mb-5">Confirmation emails are on their way. Taking you to the next page…</p>
            <button type="button" className="btn b1" onClick={onContinue}>Continue</button>
          </div>
        )}

        {modal.kind === "error" && (
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d64545] text-xl font-bold text-white">!</div>
              <h3 className="text-xl font-bold leading-tight">{modal.title}</h3>
            </div>
            {modal.message ? <p className="text-sm text-[#14202b] mb-3">{modal.message}</p> : null}
            {modal.issues.length > 0 && (
              <ul className="mb-5 grid gap-2 text-sm">
                {modal.issues.map((i, idx) => (
                  <li key={idx} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                    <span className="font-semibold">{i.label}</span>
                    <span className="text-[#5d6d7a]"> (step {i.step})</span>
                    <br />
                    <span className="text-red-700">{i.message}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-3 flex-wrap">
              <button type="button" className="btn b1" onClick={onFix} autoFocus>
                {modal.issues.length ? "Fix these fields" : "Try again"}
              </button>
              {modal.issues.length > 0 && (
                <button type="button" className="btn b2" onClick={onClose} style={{ borderColor: "var(--line)", color: "var(--ink)" }}>
                  Close
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}