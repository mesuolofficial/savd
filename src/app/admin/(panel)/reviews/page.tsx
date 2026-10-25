import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ReviewAdminActions } from "@/components/admin/ReviewAdminActions";

export default async function AdminReviewsPage() {
  await requireAdmin("reviews", "view");

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { person: true, competition: true, replies: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Reviews & Testimonials</h1>
      
      <div className="grid gap-6">
        {reviews.map((r) => (
          <div key={r.id} className="card p-6 bg-white flex flex-col md:flex-row gap-6 shadow-sm border border-line">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`pill ${r.status === "PUBLISHED" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{r.status}</span>
                <span className="text-xs font-bold text-mist uppercase">{r.role}</span>
                <span className="text-xs text-mist">· {r.competition.title}</span>
              </div>
              <p className="text-mist italic mb-4">"{r.text}"</p>
              <p className="font-bold text-ink text-sm">{r.person.name} <span className="text-xs font-mono text-signal">({r.person.savdId})</span></p>
              
              {r.replies.length > 0 && (
                <div className="mt-4 border-t border-line pt-4 space-y-2">
                  {r.replies.map(rep => (
                    <div key={rep.id} className="bg-canvas p-3 rounded text-sm text-mist">
                      <strong className="text-signal">Admin Reply:</strong> {rep.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ReviewAdminActions reviewId={r.id} status={r.status} />
          </div>
        ))}
        {reviews.length === 0 && <p className="text-mist">No reviews yet.</p>}
      </div>
    </div>
  );
}