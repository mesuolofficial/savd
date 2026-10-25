"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function ArchiveCollapsible({ 
  title, 
  icon, 
  defaultOpen = true, 
  children 
}: { 
  title: string; 
  icon: React.ReactNode; 
  defaultOpen?: boolean; 
  children: React.ReactNode 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="w-full mb-10">
      {/* Hoverable Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="group inline-flex items-center gap-3 cursor-pointer select-none pb-2 relative"
      >
        <div className="w-11 h-11 rounded-xl bg-[#FF6600]/10 border border-[#FF6600]/30 flex items-center justify-center text-[#FF6600] transition-all duration-300 group-hover:bg-[#FF6600] group-hover:text-white group-hover:-rotate-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#FF6600]/40">
          {icon}
        </div>
        
        <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-ink transition-colors duration-300 group-hover:text-[#e55a00]">
          {title}
        </h2>
        
        <ChevronDown className={`w-6 h-6 text-[#FF6600] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />

        {/* Animated Underline */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] bg-gradient-to-r from-transparent via-[#FF6600] to-transparent w-16 group-hover:w-full transition-all duration-500 ease-out" />
      </div>

      {/* Collapsible Content */}
      <div 
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0 mt-0"
        }`}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}