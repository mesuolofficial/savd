import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { EditAlbumForm } from "@/components/admin/EditAlbumForm";

export default async function EditAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("gallery", "full");
  const { id } = await params;

  const [album, competitions] = await Promise.all([
    prisma.galleryAlbum.findUnique({ where: { id } }),
    prisma.competition.findMany({ select: { id: true, title: true }, orderBy: { startDate: "desc" } }),
  ]);

  if (!album) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/admin/gallery/${album.id}`} className="text-mist hover:text-ink text-sm font-semibold">← Back to Album</Link>
      </div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Edit Album Details</h1>
      <EditAlbumForm album={album} competitions={competitions} />
    </div>
  );
}