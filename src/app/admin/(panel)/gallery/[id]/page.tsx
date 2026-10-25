import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { uploadGalleryMediaAction, deleteMediaAction, setCoverImageAction } from "@/lib/actions/gallery.actions";

export default async function ManageAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("gallery", "full");
  const { id } = await params;

  const album = await prisma.galleryAlbum.findUnique({
    where: { id },
    include: { media: { orderBy: { createdAt: "desc" } } },
  });

  if (!album) notFound();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/admin/gallery" className="text-mist hover:text-ink text-sm font-semibold">← Back to Albums</Link>
        <Link href={`/admin/gallery/${album.id}/edit`} className="btn btn-sm btn-outline-light">Edit Album Details</Link>
      </div>
      
      <div className="flex justify-between items-end mb-6 border-b border-line pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">{album.title}</h1>
          <p className="text-mist mt-1">{album.media.length} media files uploaded</p>
        </div>
      </div>

      {/* Warning Banner for External Link */}
      {album.externalUrl && (
        <div className="card p-4 mb-6 bg-warning/10 border border-warning/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-ink text-sm">This album also has an external link.</p>
            <a href={album.externalUrl} className="text-signal underline font-mono text-xs break-all" target="_blank" rel="noopener noreferrer">{album.externalUrl}</a>
          </div>
          <span className="text-xs text-mist md:text-right">Public visitors will see internal media (if any) first, then a button to this link.</span>
        </div>
      )}

      {/* UPLOAD FORM */}
      <div className="card p-6 mb-8 bg-canvas border border-line">
        <h2 className="text-lg font-bold text-ink mb-4 border-b border-line pb-2">Upload New Media</h2>
        
        {/* 👈 WRAPPED ACTION */}
        <form action={async (fd) => { await uploadGalleryMediaAction(fd); }} className="grid gap-4 md:grid-cols-[1fr_180px_auto] items-end">
          <input type="hidden" name="albumId" value={album.id} />
          
          <div>
            <label className="label">Select Files</label>
            <input type="file" name="files" multiple accept="image/*,video/*" className="input bg-white" required style={{ paddingTop: 10 }} />
          </div>
          <div>
            <label className="label">File Type</label>
            <select name="type" className="input bg-white">
              <option value="PHOTO">Photos</option>
              <option value="VIDEO">Videos</option>
            </select>
          </div>
          <div>
            <button type="submit" className="btn btn-primary w-full md:w-auto">Upload Files</button>
          </div>
        </form>
      </div>

      {/* MEDIA GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {album.media.map((m) => (
          <div key={m.id} className="relative group border border-line rounded-lg overflow-hidden bg-white shadow-sm">
            {m.type === "PHOTO" ? (
              <img src={m.file} alt="media" className="w-full h-40 object-cover" />
            ) : (
              <video src={m.file} className="w-full h-40 object-cover" />
            )}
            
            {album.coverImage === m.file && (
              <div className="absolute top-2 left-2 bg-[#D9A441] text-white text-[10px] font-bold px-2 py-1 rounded shadow-md z-10 whitespace-nowrap">COVER</div>
            )}

            <div className="absolute inset-0 bg-black/70 hidden group-hover:flex flex-col items-center justify-center gap-2 transition-all z-20 p-4">
              {album.coverImage !== m.file && m.type === "PHOTO" && (
                // 👈 WRAPPED ACTION
                <form action={async () => { await setCoverImageAction(album.id, m.id); }} className="w-full">
                  <button type="submit" className="btn btn-sm bg-[#D9A441] text-white hover:bg-[#c4923a] w-full justify-center shadow-lg whitespace-nowrap">Set as Cover</button>
                </form>
              )}
              {/* 👈 WRAPPED ACTION */}
              <form action={async () => { await deleteMediaAction(m.id, album.id); }} className="w-full">
                <button type="submit" className="btn btn-sm bg-danger text-white hover:bg-danger/90 w-full justify-center shadow-lg whitespace-nowrap">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}