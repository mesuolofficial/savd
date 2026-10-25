import { z } from "zod";

export const reviewSchema = z.object({
  competitionId: z.string().min(1, "Competition is required"),
  role: z.enum(["PARTICIPANT", "ORGANIZER", "JUDGE", "GUEST"]),
  text: z.string().trim().min(10, "Review must be at least 10 characters").max(5000),
});