"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { CompetitionFormState } from "@/types";
import { RichTextEditor } from "./RichTextEditor";

export type CompetitionFormValues = {
  title: string; slug: string; type: "TEAM" | "INDIVIDUAL"; minTeamSize: string; maxTeamSize: string;
  description: string; rules: string; eligibility: string; venue: string; prizes: string;
  bannerUrl: string; rulebookUrl: string;
  allowMultipleTeams: boolean;
  startDate: string; endDate: string; registrationDeadline: string;
};

type Props = {
  action: (prev: CompetitionFormState, fd: FormData) => Promise<CompetitionFormState>;
  initial: CompetitionFormValues;
  submitLabel: string;
};

function Field({ label, name, error, hint, children }: { label: string; name: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs font-semibold text-danger" role="alert">{error}</p> : hint ? <p className="mt-1 text-xs text-mist">{hint}</p> : null}
    </div>
  );
}

const area = { height: "auto", padding: ".65rem .875rem", lineHeight: 1.5 } as const;

export function CompetitionForm({ action, initial, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {} as CompetitionFormState);
  const e = state.fieldErrors ?? {};
  const v = initial;

  return (
    <form action={formAction} className="card grid gap-5 p-5 sm:p-6">
      {state.error ? <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm">{state.error}</div> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title *" name="title" error={e.title}><input id="title" name="title" className="input" defaultValue={v.title} required /></Field>
        <Field label="URL slug" name="slug" error={e.slug} hint="Leave empty to generate from the title."><input id="slug" name="slug" className="input" defaultValue={v.slug} placeholder="savd-2027" /></Field>
        <Field label="Type" name="type"><select id="type" name="type" className="input" defaultValue={v.type}><option value="TEAM">Team</option><option value="INDIVIDUAL">Individual</option></select></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Min team size" name="minTeamSize" error={e.minTeamSize}><input id="minTeamSize" name="minTeamSize" type="number" min={1} className="input" defaultValue={v.minTeamSize} /></Field>
          <Field label="Max team size" name="maxTeamSize" error={e.maxTeamSize}><input id="maxTeamSize" name="maxTeamSize" type="number" min={1} className="input" defaultValue={v.maxTeamSize} /></Field>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Starts (Pakistan time) *" name="startDate" error={e.startDate}><input id="startDate" name="startDate" type="datetime-local" className="input" defaultValue={v.startDate} required /></Field>
        <Field label="Ends (Pakistan time) *" name="endDate" error={e.endDate}><input id="endDate" name="endDate" type="datetime-local" className="input" defaultValue={v.endDate} required /></Field>
        <Field label="Registration deadline *" name="registrationDeadline" error={e.registrationDeadline}><input id="registrationDeadline" name="registrationDeadline" type="datetime-local" className="input" defaultValue={v.registrationDeadline} required /></Field>
      </div>

      <Field label="Venue" name="venue" error={e.venue}><input id="venue" name="venue" className="input" defaultValue={v.venue} /></Field>
      
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Banner Image (JPG/PNG)</label>
          {v.bannerUrl && (
            <div style={{ marginBottom: 10 }}>
              <img src={v.bannerUrl} alt="Banner" style={{ height: 100, borderRadius: 8, objectFit: "cover", border: "1px solid var(--line)" }} />
              <label style={{ display: "block", marginTop: 8, fontSize: 13 }}><input type="checkbox" name="removeBanner" /> Remove banner</label>
            </div>
          )}
          <input type="file" name="bannerFile" accept="image/*" className="input" style={{ paddingTop: 10 }} />
          <input type="hidden" name="existingBannerUrl" value={v.bannerUrl} />
        </div>

        <div>
          <label className="label">Rulebook PDF</label>
          {v.rulebookUrl && (
            <div style={{ marginBottom: 10 }}>
              <a href={v.rulebookUrl} target="_blank" rel="noopener noreferrer" className="text-signal text-sm font-semibold">📄 View Current Rulebook</a>
              <label style={{ display: "block", marginTop: 8, fontSize: 13 }}><input type="checkbox" name="removeRulebook" /> Remove rulebook</label>
            </div>
          )}
          <input type="file" name="rulebookFile" accept="application/pdf" className="input" style={{ paddingTop: 10 }} />
          <input type="hidden" name="existingRulebookUrl" value={v.rulebookUrl} />
        </div>
      </div>

      <div className="bg-canvas p-4 rounded-lg border border-line">
        <label className="flex gap-3 items-start cursor-pointer">
          <input type="checkbox" name="allowMultipleTeams" defaultChecked={v.allowMultipleTeams} className="mt-1" />
          <div>
            <p className="font-bold text-sm">Allow participants to join multiple teams in this competition</p>
            <p className="text-xs text-mist mt-1">If unchecked (default), the system will strictly enforce that one CNIC can only be used for one team in this specific competition.</p>
          </div>
        </label>
      </div>

      <Field label="Description" name="description" error={e.description}>
        <RichTextEditor name="description" defaultValue={v.description} />
      </Field>
      
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Rules" name="rules" error={e.rules}>
          <RichTextEditor name="rules" defaultValue={v.rules} />
        </Field>
        <Field label="Eligibility" name="eligibility" error={e.eligibility}>
          <RichTextEditor name="eligibility" defaultValue={v.eligibility} />
        </Field>
      </div>

      <Field label="Prizes" name="prizes" hint="One per line: Label | Amount | medal (optional)." error={e.prizes}>
        <textarea id="prizes" name="prizes" rows={4} className="input" style={area} defaultValue={v.prizes} />
      </Field>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : submitLabel}</button>
        <Link href="/admin/competitions" className="btn btn-outline-light">Cancel</Link>
      </div>
    </form>
  );
}