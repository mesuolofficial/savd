import { prisma } from "@/lib/prisma";
import { PostReviewForm } from "@/components/public/PostReviewForm";
import { MeltEdge } from "@/components/public/MeltEdge";

export default async function PostReviewIndex() {
  const competitions = await prisma.competition.findMany({ where: { isPublished: true }, select: { id: true, title: true, slug: true } });

  return (
    <>
      <header className="ph dk">
        <div className="wrap">
          <p className="ey">Community</p>
          <h1>Post a Review</h1>
          <p className="sub">Select the competition you participated in.</p>
        </div>
      </header>
      <MeltEdge seed={88} />
      <section className="pg bg-[#fafaf8]">
        <div className="wrap max-w-lg mx-auto">
          <PostReviewForm competitions={competitions} />
        </div>
      </section>
    </>
  );
}