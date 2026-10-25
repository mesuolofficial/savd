import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MeltEdge } from "@/components/public/MeltEdge";
import { AlbumGrid } from "@/components/public/AlbumGrid";
import { ExternalLink } from "lucide-react";

export default async function AlbumDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const album = await prisma.galleryAlbum.findUnique({
    where: { slug, isPublished: true },
    include: {
      competition: { select: { title: true } },
      media: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!album) notFound();

  return (
    <>
      <header className="ph dk" style={{ paddingBottom: 60 }}>
        <div className="wrap max-w-5xl mx-auto">
          <div className="mb-4">
            <Link href="/gallery" className="text-glow hover:text-white text-sm font-semibold transition-colors">← Back to Gallery</Link>
          </div>
          <p className="ey">Album</p>
          <h1>{album.title}</h1>
          {album.competition && <p className="sub">{album.competition.title}</p>}
        </div>
      </header>
      <MeltEdge seed={66} />

      <section className="pg">
        <div className="wrap max-w-6xl mx-auto">
          
          {album.description && (
            <div className="max-w-4xl mx-auto mb-12 text-center px-4">
              <div 
                className="tx text-lg" 
                dangerouslySetInnerHTML={{ __html: album.description }} 
              />
            </div>
          )}

          {album.media.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6 border-b border-line pb-4">
                <p className="font-bold text-ink">{album.media.length} Media Items</p>
              </div>
              <AlbumGrid media={album.media} />
            </>
          ) : (
            !album.externalUrl && (
              <p className="text-center text-mist py-12">No media uploaded yet.</p>
            )
          )}

          {/* External Link Button at the bottom */}
          {album.externalUrl && (
            <div className="mt-16 text-center p-8 bg-canvas rounded-xl border border-line max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-ink mb-2">Want to see more?</h3>
              <p className="text-mist mb-6">Check out the full album on our external platform.</p>
              <a 
                href={album.externalUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn b1 inline-flex items-center gap-2"
              >
                <ExternalLink className="size-5" />
                View Remaining Photos
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}