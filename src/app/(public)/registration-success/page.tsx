import type { Metadata } from "next";
import Link from "next/link";
import { MeltEdge } from "@/components/public/MeltEdge";

export const metadata: Metadata = { title: "Registration received" };

export default async function RegistrationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string; comp?: string }>;
}) {
  const { team, comp } = await searchParams;
  const teamName = team || "your team";

  return (
    <>
      <header className="ph dk">
        <div className="wrap">
          <p className="ey">Registration received</p>
          <h1>You&apos;re in.</h1>
          <p className="sub">We&apos;ve got your registration for {teamName}.</p>
        </div>
      </header>
      <MeltEdge seed={17} />

      <section className="pg">
        <div className="wrap" style={{ maxWidth: 720 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 16, color: "var(--color-signal)" }}>✓</div>
            <h2 style={{ fontSize: 28, marginBottom: 12 }}>Check your inbox</h2>
            <p style={{ fontSize: 16, color: "var(--mist)" }}>
              We&apos;ve emailed every team member a confirmation. If you don&apos;t see it in a few minutes, check your spam folder.
            </p>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 20, marginBottom: 16 }}>What happens next</h3>
            <ol style={{ paddingLeft: 20, display: "grid", gap: 14 }}>
              <li>
                <strong>Pending review.</strong> The organizers will look at your registration and verify the details.
              </li>
              <li>
                <strong>Approval email.</strong> When they approve it, the leader and every member gets an email.
              </li>
              <li>
                <strong>Team profile.</strong> Once approved, your team gets its own profile on the site with your logo, description and prototype media.
              </li>
            </ol>
          </div>

          <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {comp ? <Link className="btn b1" href={`/competitions/${comp}`}>Back to competition</Link> : null}
            <Link className="btn btn-outline-light" href="/" style={{ borderColor: "var(--color-line)", color: "var(--color-ink)" }}>Back to home</Link>
          </div>
        </div>
      </section>
    </>
  );
}