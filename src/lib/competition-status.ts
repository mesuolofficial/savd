export type CompetitionState = "UPCOMING" | "ONGOING" | "ENDED";

export function competitionState(c: { startDate: Date; endDate: Date }, now = new Date()): CompetitionState {
  return now < c.startDate ? "UPCOMING" : now <= c.endDate ? "ONGOING" : "ENDED";
}

/** Registration is open only if an admin switched it on AND the deadline has not passed (FR-1/FR-2). */
export function isRegistrationOpen(c: { registrationOpen: boolean; registrationDeadline: Date }, now = new Date(), globalOpen = true): boolean {
  return globalOpen && c.registrationOpen && now < c.registrationDeadline; // globalOpen = the site-wide switch (FR-18)
}
