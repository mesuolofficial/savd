"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { GalleryLightbox } from "./GalleryLightbox";

type Media = { id: string; type: "PHOTO" | "VIDEO"; file: string; caption: string | null };

export function AlbumGrid({ media }: { media: Media[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (media.length === 0) {
    return <p className="text-center text-mist py-10">No media in this album yet.</p>;
  }

  return (
    <>
      {/* 
        UPDATED: 
        - Increased columns (lg:columns-5, xl:columns-6) makes images ~40% smaller.
        - Reduced gap (gap-3, space-y-3) for a tighter, more professional look.
      */}
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3 space-y-3">
        {media.map((m, index) => (
          <div 
            key={m.id} 
            className="break-inside-avoid relative group rounded-lg overflow-hidden bg-canvas cursor-pointer border border-line/50 shadow-sm"
            onClick={() => setLightboxIndex(index)}
          >
            {m.type === "PHOTO" ? (
              <img 
                src={m.file} 
                alt={m.caption || "Gallery image"} 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" 
                loading="lazy"
              />
            ) : (
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                <video src={m.file} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-lg pl-1 border border-white/20">
                    ▶
                  </div>
                </div>
              </div>
            )}

            {/* HOVER EFFECT */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white border border-white/30 transform scale-50 group-hover:scale-100 transition-transform duration-300">
                <Maximize2 className="size-3" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox 
          media={media} 
          initialIndex={lightboxIndex} 
          onClose={() => setLightboxIndex(null)} 
        />
      )}
    </>
  );
}