import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MeltEdge } from "@/components/public/MeltEdge";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Gallery" };

export default async function PublicGalleryPage() {
  const albums = await prisma.galleryAlbum.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    include: {
      competition: { select: { title: true } },
      media: { take: 1, orderBy: { createdAt: "asc" } },
      _count: { select: { media: true } },
      createdBy: { select: { name: true, avatar: true } }, 
    },
  });

  return (
    <>
      <header className="ph dk">
        <div className="wrap">
          <p className="ey">Moments</p>
          <h1>Gallery</h1>
          <p className="sub">Relive the highlights, the engineering, and the energy of SAVD.</p>
        </div>
      </header>
      <MeltEdge seed={55} />

      <section className="pg">
        <div className="wrap">
          {albums.length === 0 ? (
            <div className="card p-12 text-center max-w-lg mx-auto">
              <p className="text-lg font-bold text-ink mb-2">No albums yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {albums.map((a) => {
                const cover = a.coverImage || a.media[0]?.file;
                const hasInternalMedia = a._count.media > 0;
                
                // If no internal media, but external link exists, go straight to external URL
                const isDirectExternal = !hasInternalMedia && !!a.externalUrl;
                const linkUrl = hasInternalMedia ? `/gallery/${a.slug}` : (a.externalUrl || `/gallery/${a.slug}`);
                
                return (
                  <Link 
                    key={a.id} 
                    href={linkUrl} 
                    target={isDirectExternal ? "_blank" : undefined} 
                    className="group block bg-white rounded-xl border border-line overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] bg-canvas overflow-hidden">
                      {cover ? (
                        <img src={cover} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-mist">No Cover Image</div>
                      )}
                      
                      <div className="absolute top-3 right-3">
                        <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                          📷 {a._count.media}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <span className="bg-white text-ink font-bold px-6 py-2.5 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl text-sm">
                          <ExternalLink className="size-4" /> {isDirectExternal ? "Open Link" : "Open Album"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-ink leading-tight mb-1 group-hover:text-signal transition-colors line-clamp-2">{a.title}</h3>
                      <p className="text-xs text-mist mb-4">{a.competition?.title || "SAVD Event"}</p>
                      
                      <div className="flex items-center justify-between border-t border-line/50 pt-3 mt-auto">
                        <span className="text-xs text-mist flex items-center gap-1.5">
                          {a.createdBy?.avatar ? (
                            <img src={a.createdBy.avatar} alt={a.createdBy.name} className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <img src="/images/brand/logo.png" alt="SAVD" className="w-5 h-5 rounded-full object-contain" />
                          )}
                          {a.createdBy?.name || "SAVD Team"}
                        </span>
                        <span className="text-xs text-mist">{formatDate(a.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}