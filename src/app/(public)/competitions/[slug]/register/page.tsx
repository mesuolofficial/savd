import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { isRegistrationOpen } from "@/lib/competition-status";
import { formatDateRange, formatDateTime } from "@/lib/format";
import { MeltEdge } from "@/components/public/MeltEdge";
import { MultiStepRegisterForm } from "@/components/public/MultiStepRegisterForm";
import { submitRegistrationAction } from "@/lib/actions/registration.actions";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await prisma.competition.findFirst({ where: { slug, isPublished: true }, select: { title: true } });
  return { title: c ? `Register — ${c.title}` : "Register" };
}

export default async function RegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const competition = await prisma.competition.findFirst({ where: { slug, isPublished: true } });
  if (!competition) notFound();

  const settings = await getSettings();
  const open = isRegistrationOpen(competition, new Date(), settings.globalRegistrationOpen);

  if (!open) {
    const closedReason =
      !settings.globalRegistrationOpen || !competition.registrationOpen
        ? "The organizers have closed registration for this edition."
        : `The registration deadline passed on ${formatDateTime(competition.registrationDeadline)}.`;
    return (
      <>
        <header className="ph dk">
          <div className="wrap">
            <p className="ey">Registration</p>
            <h1>Registration closed</h1>
          </div>
        </header>
        <MeltEdge seed={41} />
        <section className="pg">
          <div className="wrap" style={{ maxWidth: 640, textAlign: "center" }}>
            <p style={{ fontSize: 18, marginBottom: 20 }}>
              Registration for <strong>{competition.title}</strong> is currently closed.
            </p>
            <p style={{ color: "var(--mist)", marginBottom: 24 }}>{closedReason}</p>
            <Link className="btn b1" href={`/competitions/${competition.slug}`}>View competition</Link>
          </div>
        </section>
      </>
    );
  }

  const universities = await prisma.university.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const boundAction = submitRegistrationAction.bind(null, competition.slug);

  return (
    <>
      <header className="ph dk">
        <div className="wrap">
          <p className="ey">Team registration</p>
          <h1>{competition.title}</h1>
          <p className="sub">{formatDateRange(competition.startDate, competition.endDate)}</p>
        </div>
      </header>
      <MeltEdge seed={29} />

      <section className="pg">
        <div className="wrap">
          <MultiStepRegisterForm
            competition={{
              slug: competition.slug,
              title: competition.title,
              minTeamSize: competition.minTeamSize,
              maxTeamSize: competition.maxTeamSize,
              registrationDeadline: formatDateTime(competition.registrationDeadline),
              venue: competition.venue || null,
            }}
            universities={universities}
            action={boundAction}
          />
        </div>
      </section>
    </>
  );
}