"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
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

const STEP1_FIELDS = ["teamName", "leaderName", "leaderEmail", "leaderWhatsapp", "leaderSapId", "leaderCnic", "leaderDepartment", "leaderUniversityId", "leaderUniversityText", "referralCode"];
const STEP3_FIELDS = ["consentTransactionalSms", "consentMarketingSms", "consentTerms"];

const formatCnic = (val: string) => {
  let digits = val.replace(/\D/g, "").slice(0, 13);
  if (digits.length > 12) {
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
  } else if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return digits;
};

export function MultiStepRegisterForm({ competition, universities, action }: Props) {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(action, {} as RegistrationActionState);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const [uniSearch, setUniSearch] = useState("");
  const [uniId, setUniId] = useState("");
  
  const e = state?.fieldErrors ?? {};

  const [refCode, setRefCode] = useState("");
  const [refStatus, setRefStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [refName, setRefName] = useState("");
  
  // 👈 YAHAN FIX KIYA GAYA HAI: useRef mein initial value `undefined` add ki hai
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const urlRef = searchParams.get("ref")?.replace(/[^a-zA-Z0-9-]/g, "");
    if (urlRef) {
      const formatted = urlRef.toUpperCase();
      setRefCode(formatted);
      checkReferral(formatted);
    }
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

  const handleRefChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setRefCode(val);
    checkReferral(val);
  };

  const handleUniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUniSearch(val);
    const trimmed = val.trim();
    const match = universities.find((u) => u.name.toLowerCase() === trimmed.toLowerCase());
    if (match) {
      setUniId(match.id);
    } else {
      setUniId("other");
    }
  };

  useEffect(() => {
    if (!state?.error || !state?.fieldErrors) return;
    const err = state.fieldErrors;
    if (STEP1_FIELDS.some((f) => err[f])) { setStep(1); return; }
    if (Object.keys(err).some((k) => k.startsWith("members."))) { setStep(2); return; }
    if (STEP3_FIELDS.some((f) => err[f])) { setStep(3); }
  }, [state]);

  const maxMembers = Math.max(0, competition.maxTeamSize - 1);

  return (
    <form action={formAction} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10 items-start">
      <div className="min-w-0">
        <div className="mb-6 flex gap-2">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className={`flex-1 py-2 px-3 rounded-lg text-center text-xs font-bold tracking-wider uppercase ${step >= n ? "bg-[#226192] text-white" : "bg-[#d8d2c6] text-[#14202b]"}`}>
              {n}. {n === 1 ? "Team & Leader" : n === 2 ? "Members" : "Consent"}
            </div>
          ))}
        </div>

        {state?.error ? (
          <div role="alert" className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
            {state.error}
          </div>
        ) : null}

        <div style={{ display: step === 1 ? "block" : "none" }}>
          <h2 className="text-2xl font-bold mb-4">Team &amp; leader</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="teamName" className="label">Team name *</label>
              <input id="teamName" name="teamName" className="input" required maxLength={120} />
              {e.teamName ? <p className="text-xs text-red-600 mt-1">{e.teamName}</p> : null}
            </div>
            <div>
              <label htmlFor="leaderName" className="label">Leader full name *</label>
              <input id="leaderName" name="leaderName" className="input" required />
              {e.leaderName ? <p className="text-xs text-red-600 mt-1">{e.leaderName}</p> : null}
            </div>
            <div>
              <label htmlFor="leaderEmail" className="label">Leader email *</label>
              <input id="leaderEmail" name="leaderEmail" type="email" className="input" required />
              {e.leaderEmail ? <p className="text-xs text-red-600 mt-1">{e.leaderEmail}</p> : null}
            </div>
            <div>
              <label htmlFor="leaderWhatsapp" className="label">WhatsApp number *</label>
              <input id="leaderWhatsapp" name="leaderWhatsapp" type="tel" className="input" required />
              {e.leaderWhatsapp ? <p className="text-xs text-red-600 mt-1">{e.leaderWhatsapp}</p> : null}
            </div>
            <div>
              <label htmlFor="leaderSapId" className="label">Student ID *</label>
              <input id="leaderSapId" name="leaderSapId" className="input" required />
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
                onChange={(e) => {
                  e.target.value = formatCnic(e.target.value);
                }}
              />
              {e.leaderCnic ? <p className="text-xs text-red-600 mt-1">{e.leaderCnic}</p> : null}
            </div>
            
            <div>
              <label htmlFor="leaderDepartment" className="label">Department *</label>
              <input id="leaderDepartment" name="leaderDepartment" className="input" required />
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
                <option value="Other (Please specify)" />
              </datalist>
              <input type="hidden" name="leaderUniversityId" value={uniId} />
              
              <p className="text-xs text-mist mt-1">
                Not in the list? Just type your institution's full name.
              </p>

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
              {refStatus === "idle" && <p className="text-xs text-mist mt-1">Leave blank if you weren't referred by a partner.</p>}
              {e.referralCode && <p className="text-xs text-red-600 mt-1">{e.referralCode}</p>}
            </div>
          </div>
          <div className="mt-6">
            <button type="button" className="btn b1" onClick={() => setStep(2)}>Next →</button>
          </div>
        </div>

        <div style={{ display: step === 2 ? "block" : "none" }}>
          <h2 className="text-2xl font-bold mb-2">Additional members</h2>
          <p className="mb-4 text-[#5d6d7a] text-sm">
            Team total must be <strong>{competition.minTeamSize}–{competition.maxTeamSize}</strong> including you (the leader).
            {maxMembers === 0 ? " This is a solo competition — no additional members needed." : ` Add up to ${maxMembers} more.`}
          </p>
          {maxMembers > 0 ? <MemberRepeater maxMembers={maxMembers} errors={e} /> : null}
          <div className="mt-6 flex gap-3">
            <button type="button" className="btn b2" onClick={() => setStep(1)} style={{ borderColor: "var(--line)", color: "var(--ink)" }}>← Back</button>
            <button type="button" className="btn b1" onClick={() => setStep(3)}>Next →</button>
          </div>
        </div>

        <div style={{ display: step === 3 ? "block" : "none" }}>
          <h2 className="text-2xl font-bold mb-4">Consent &amp; submit</h2>
          <div className="grid gap-3 mb-5">
            <label className="flex gap-2 items-start text-sm">
              <input type="checkbox" name="consentTransactionalSms" className="mt-1" />
              <span>I agree to receive transactional messages about my team (required)</span>
            </label>
            {e.consentTransactionalSms ? <p className="text-xs text-red-600">{e.consentTransactionalSms}</p> : null}
            <label className="flex gap-2 items-start text-sm">
              <input type="checkbox" name="consentMarketingSms" className="mt-1" />
              <span>I agree to receive updates from SAVD (required)</span>
            </label>
            {e.consentMarketingSms ? <p className="text-xs text-red-600">{e.consentMarketingSms}</p> : null}
            <label className="flex gap-2 items-start text-sm">
              <input type="checkbox" name="consentTerms" className="mt-1" />
              <span>I accept the Terms of Service and Privacy Policy (required)</span>
            </label>
            {e.consentTerms ? <p className="text-xs text-red-600">{e.consentTerms}</p> : null}
          </div>
          <p className="mb-5 text-sm text-[#5d6d7a]">
            On submit we&apos;ll email the leader and every member a confirmation. Your registration will be marked <strong>Pending review</strong> until the organizers approve it.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button type="button" className="btn b2" onClick={() => setStep(2)} style={{ borderColor: "var(--line)", color: "var(--ink)" }}>← Back</button>
            <button type="submit" className="btn b1" disabled={pending}>{pending ? "Submitting…" : "Submit registration"}</button>
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
  );
}