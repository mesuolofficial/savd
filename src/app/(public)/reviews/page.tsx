import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MeltEdge } from "@/components/public/MeltEdge";
import { ReviewCard } from "@/components/public/ReviewCard";
import { ReviewFilters } from "@/components/public/ReviewFilters";

export default async function PublicReviewsPage({ searchParams }: { searchParams: Promise<{ comp?: string, role?: string, msg?: string }> }) {
  const { comp, role, msg } = await searchParams;

  const competitions = await prisma.competition.findMany({ where: { isPublished: true }, select: { id: true, title: true } });

  const reviews = await prisma.review.findMany({
    where: { 
      status: "PUBLISHED",
      ...(comp ? { competitionId: comp } : {}),
      ...(role ? { role: role as any } : {})
    },
    orderBy: { publishedAt: "desc" },
    include: {
      person: { select: { name: true, photo: true } },
      competition: { select: { title: true } },
      replies: {
        include: { admin: { select: { name: true, avatar: true } } } // <--- FETCH ADMIN FOR REPLIES
      },
    },
  });

  return (
    <>
      <header className="ph dk">
        <div className="wrap">
          <p className="ey">Community</p>
          <h1>Reviews</h1>
          <p className="sub">What our participants say about SAVD.</p>
        </div>
      </header>
      <MeltEdge seed={88} />

      <section className="pg bg-[#fafaf8]">
        <div className="wrap max-w-6xl mx-auto">
          
          {msg === "submitted" && (
            <div className="mb-6 p-4 bg-success/10 border border-success/30 text-success text-sm rounded-xl text-center font-bold">
              ✓ Your review has been submitted and is pending approval.
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <Link href="/reviews/post" className="btn b1">✎ Post a Review</Link>
            <ReviewFilters competitions={competitions} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(r => (
              <div key={r.id} id={`review-${r.id}`} className="scroll-mt-24 h-full">
                <ReviewCard 
                  id={r.id} 
                  text={r.text} 
                  role={r.role} 
                  person={r.person} 
                  competition={r.competition} 
                  replies={r.replies as any} 
                />
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="col-span-full text-center text-mist py-10">No reviews match these filters.</p>
            )}
          </div>

        </div>
      </section>
    </>
  );
}