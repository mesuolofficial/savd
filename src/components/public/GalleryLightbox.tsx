"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

type Media = { id: string; type: "PHOTO" | "VIDEO"; file: string; caption: string | null };

export function GalleryLightbox({ media, initialIndex, onClose }: { media: Media[], initialIndex: number, onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex);
  const current = media[index];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
      if (e.key === "ArrowRight") setIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [media.length, onClose]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 text-white">
        <span className="text-sm font-semibold tracking-widest">{index + 1} / {media.length}</span>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="size-6" /></button>
      </div>

      {/* Main Media */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        <button onClick={() => setIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))} className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-all"><ChevronLeft className="size-8" /></button>
        
        {current.type === "PHOTO" ? (
          <img src={current.file} alt="Gallery item" className="max-h-[80vh] max-w-[90vw] object-contain select-none" />
        ) : (
          <video src={current.file} controls autoPlay className="max-h-[80vh] max-w-[90vw] object-contain" />
        )}

        <button onClick={() => setIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))} className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-all"><ChevronRight className="size-8" /></button>
      </div>

      {/* Bottom Bar */}
      <div className="p-4 flex justify-center">
        <a href={current.file} download target="_blank" rel="noopener noreferrer" className="btn b1 flex items-center gap-2">
          <Download className="size-5" /> Download HD
        </a>
      </div>
    </div>
  );
}