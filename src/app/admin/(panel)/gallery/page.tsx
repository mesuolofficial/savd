import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { Notice } from "@/components/admin/Notice";
import { toggleAlbumPublishAction, deleteAlbumAction } from "@/lib/actions/gallery.actions";

export default async function AdminGalleryPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireAdmin("gallery", "view");
  const { msg } = await searchParams;

  const albums = await prisma.galleryAlbum.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      competition: { select: { title: true } },
      _count: { select: { media: true } },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">Gallery Albums</h1>
        <Link href="/admin/gallery/create" className="btn btn-primary">+ Create Album</Link>
      </div>

      {msg === "created" && <Notice kind="ok">Album created successfully.</Notice>}
      {msg === "deleted" && <Notice kind="ok">Album deleted.</Notice>}

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-canvas border-b border-line">
            <tr>
              <th className="p-4">Album Title</th>
              <th className="p-4">Competition</th>
              <th className="p-4">Status</th>
              <th className="p-4">Media</th>
              <th className="p-4">Created</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {albums.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-mist">No albums found. Create one to get started.</td></tr>
            ) : albums.map((a) => (
              <tr key={a.id} className="border-b border-line/50 hover:bg-canvas/30">
                <td className="p-4 font-bold text-ink max-w-[250px] truncate" title={a.title}>{a.title}</td>
                <td className="p-4 text-mist max-w-[200px] truncate" title={a.competition?.title || "General"}>{a.competition?.title || "General"}</td>
                <td className="p-4">
                  <form action={toggleAlbumPublishAction.bind(null, a.id, !a.isPublished)}>
                    <button type="submit" className={`btn btn-sm ${a.isPublished ? "bg-success/20 text-success" : "bg-warning/20 text-warning"} whitespace-nowrap`}>
                      {a.isPublished ? "Published" : "Draft"}
                    </button>
                  </form>
                </td>
                <td className="p-4 font-semibold text-signal">{a._count.media} files</td>
                <td className="p-4 text-mist">{formatDate(a.createdAt)}</td>
                <td className="p-4">
                  <div className="flex gap-2 items-center">
                    
                    {/* MANAGE MEDIA (Always visible) */}
                    <Link href={`/admin/gallery/${a.id}`} className="btn btn-sm btn-outline-light whitespace-nowrap">
                      Manage Media
                    </Link>

                    {/* EDIT ALBUM (Always visible) */}
                    <Link href={`/admin/gallery/${a.id}/edit`} className="btn btn-sm btn-outline-light whitespace-nowrap">
                      Edit
                    </Link>

                    {/* VISIT EXTERNAL LINK (Only if URL exists) */}
                    {a.externalUrl && (
                      <a href={a.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light whitespace-nowrap text-signal border-signal/30 hover:bg-signal/5">
                        Visit Link ↗
                      </a>
                    )}

                    {/* DELETE */}
                    <form action={deleteAlbumAction.bind(null, a.id)}>
                      <button type="submit" className="btn btn-sm text-danger hover:bg-danger/10 whitespace-nowrap">Delete</button>
                    </form>
                    
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}