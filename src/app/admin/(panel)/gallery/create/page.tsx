import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { CreateAlbumForm } from "@/components/admin/CreateAlbumForm";

export default async function CreateAlbumPage() {
  await requireAdmin("gallery", "full");

  const competitions = await prisma.competition.findMany({
    select: { id: true, title: true },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/gallery" className="text-mist hover:text-ink text-sm font-semibold">← Back to Albums</Link>
      </div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Create New Album</h1>
      <CreateAlbumForm competitions={competitions} />
    </div>
  );
}