import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createCompetitionAction } from "@/lib/actions/competition.actions";
import { CompetitionForm } from "@/components/admin/CompetitionForm";

export const metadata: Metadata = { title: "New competition" };

export default async function CreateCompetitionPage() {
  const admin = await requireAdmin("competitions", "full");
  if (admin.competitionId) redirect("/admin/dashboard?denied=1");
  
  // 👈 MISSING FIELDS ADD KAREIN (bannerUrl, rulebookUrl, allowMultipleTeams)
  const initialData = { 
    title: "", slug: "", type: "TEAM" as const, minTeamSize: "3", maxTeamSize: "5", 
    description: "", rules: "", eligibility: "", venue: "", prizes: "", 
    startDate: "", endDate: "", registrationDeadline: "",
    bannerUrl: "", rulebookUrl: "", allowMultipleTeams: false
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold uppercase tracking-wide text-ink">New competition</h1>
      <CompetitionForm
        action={createCompetitionAction}
        submitLabel="Create competition"
        initial={initialData}
      />
    </div>
  );
}