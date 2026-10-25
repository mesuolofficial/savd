import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getSession } from "@/lib/session";
import { Ticker } from "@/components/public/Ticker";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { MaintenanceScreen } from "@/components/public/MaintenanceScreen";
import { PublicEffects } from "@/components/public/PublicEffects";

// Reads the database on every request for now; caching comes later.
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, session] = await Promise.all([getSettings(), getSession()]);
  // Maintenance mode (FR-18): visitors see the maintenance page; signed-in admins still see the real site.
  if (settings.maintenanceMode && !session) return <MaintenanceScreen />;

  const open = settings.globalRegistrationOpen
    ? await prisma.competition.findFirst({
        where: { isPublished: true, registrationOpen: true, registrationDeadline: { gte: new Date() } },
        orderBy: { startDate: "asc" }, select: { slug: true },
      })
    : null;

  return (
    <div className="pub">
      <Ticker />
      <Navbar ctaLabel={open ? "Register" : "Competitions"} ctaHref={open ? `/competitions/${open.slug}/register` : "/competitions"} />
      {children}
      <Footer site={{ email: settings.adminEmail, phone: settings.contactPhone, address: settings.contactAddress, facebook: settings.facebookUrl, instagram: settings.instagramUrl, twitter: settings.twitterUrl }} />
      <PublicEffects />
    </div>
  );
}
