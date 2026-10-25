"use client";

import { useEffect, useState } from "react";

type Props = {
  src: string;
  alt?: string;
  children: React.ReactNode; // The thumbnail image/button that triggers the lightbox
};

export function Lightbox({ src, alt, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!src) return <>{children}</>;

  return (
    <>
      <div onClick={() => setIsOpen(true)} style={{ cursor: "zoom-in" }}>
        {children}
      </div>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 47, 75, 0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            backdropFilter: "blur(5px)",
          }}
          onClick={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(false)}
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "50%",
              width: 44,
              height: 44,
              color: "#fff",
              fontSize: 24,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
            }}
            aria-label="Close image"
          >
            ✕
          </button>
          <img
            src={src}
            alt={alt || "Expanded image"}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 8,
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              animation: "fadeIn 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
        </div>
      )}
    </>
  );
}