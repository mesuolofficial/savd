"use client";

export function ArchiveHeading({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex justify-center mb-8 w-full">
      <div className="group inline-flex items-center gap-3 relative pb-3 cursor-default">
        <div className="w-11 h-11 rounded-xl bg-[#FF6600]/10 border border-[#FF6600]/30 flex items-center justify-center text-[#FF6600] transition-all duration-300 group-hover:bg-[#FF6600] group-hover:text-white group-hover:-rotate-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#FF6600]/40">
          {icon}
        </div>
        
        <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-ink transition-colors duration-300 group-hover:text-[#e55a00]">
          {title}
        </h2>

        {/* Animated Underline */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] bg-gradient-to-r from-transparent via-[#FF6600] to-transparent w-16 group-hover:w-full transition-all duration-500 ease-out" />
      </div>
    </div>
  );
}