import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MeltEdge } from "@/components/public/MeltEdge";
import { PostReviewWizard } from "@/components/public/PostReviewWizard";

export default async function PostReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const competition = await prisma.competition.findFirst({ where: { slug, isPublished: true }, select: { id: true, title: true, slug: true } });
  
  if (!competition) notFound();

  return (
    <>
      <header className="ph dk">
        <div className="wrap">
          <p className="ey">Community</p>
          <h1>Post a Review</h1>
        </div>
      </header>
      <MeltEdge seed={88} />
      <section className="pg bg-[#fafaf8] flex items-center">
        <div className="wrap w-full">
          <PostReviewWizard competition={competition} />
        </div>
      </section>
    </>
  );
}