import { z } from "zod";

export const competitionSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  slug: z.string().trim().max(80).default(""),
  type: z.enum(["TEAM", "INDIVIDUAL"]),
  minTeamSize: z.coerce.number().int().min(1, "At least 1").max(50),
  maxTeamSize: z.coerce.number().int().min(1, "At least 1").max(50),
  description: z.string().max(20000).default(""),
  rules: z.string().max(20000).default(""),
  eligibility: z.string().max(10000).default(""),
  venue: z.string().trim().max(200).default(""),
  prizes: z.string().max(4000).default(""),
  allowMultipleTeams: z.preprocess((v) => v === "on" || v === true, z.boolean()).default(false),
  startDate: z.string(),
  endDate: z.string(),
  registrationDeadline: z.string(),
});

export type Prize = { label: string; amount: string; medal: "GOLD" | "SILVER" | "BRONZE" | "NONE" };

export function parsePrizes(text: string): Prize[] {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line) => {
    const [label = "", amount = "", medal = ""] = line.split("|").map((p) => p.trim());
    const m = medal.toUpperCase();
    return { label, amount, medal: (["GOLD", "SILVER", "BRONZE"].includes(m) ? m : "NONE") as Prize["medal"] };
  }).filter((p) => p.label);
}

export function formatPrizes(json: unknown): string {
  if (!Array.isArray(json)) return "";
  return (json as Prize[]).map((p) => [p.label, p.amount, p.medal && p.medal !== "NONE" ? p.medal.toLowerCase() : ""].filter((x, i) => i < 2 || x).join(" | ")).join("\n");
}