"use client";

import { useState } from "react";
import { CornerDownRight, ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  id: string;
  text: string;
  role: string;
  person: { name: string; photo: string | null };
  competition: { title: string } | null;
  replies: { id: string; message: string; createdAt: Date; admin: { name: string | null; avatar: string | null } | null }[];
};

export function ReviewCard({ id, text, role, person, competition, replies }: Props) {
  const [showReplies, setShowReplies] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const toggleReplies = () => setShowReplies(!showReplies);

  return (
    <div className="card p-6 bg-white border border-line h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
      
      {/* Review Text */}
      <div className="relative mb-6 flex-1">
        <span className="text-4xl text-[#EF8557] font-serif leading-none absolute -top-2 -left-1 opacity-50">“</span>
        <p className={`text-sm text-mist italic leading-relaxed pl-4 ${expanded ? "" : "line-clamp-4"}`}>
          {text}
        </p>
        {text.length > 150 && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs font-bold text-signal mt-2 ml-4 hover:underline">
            {expanded ? "Read less" : "Read more"}
          </button>
        )}
      </div>

      {/* Person Info */}
      <div className="flex items-center gap-3 mb-4 border-t border-line/50 pt-4">
        {person.photo ? (
          <img src={person.photo} alt={person.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-signal text-white flex items-center justify-center font-bold text-sm">
            {person.name[0]}
          </div>
        )}
        <div>
          <p className="font-bold text-ink text-sm">{person.name}</p>
          <p className="text-xs text-mist">
            {role} · {competition?.title || "SAVD Event"}
          </p>
        </div>
      </div>

      {/* Replies Toggle */}
      {replies.length > 0 && (
        <div className="mt-auto">
          <button 
            onClick={toggleReplies}
            className="flex items-center gap-2 text-sm font-bold text-signal hover:text-[#d1693e] transition-colors"
          >
            <CornerDownRight className="size-4" /> 
            Replies ({replies.length}) 
            {showReplies ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>

          {/* Replies List */}
          {showReplies && (
            <div className="mt-4 space-y-3 pl-2 border-l-2 border-signal/20">
              {replies.map((reply) => (
                <div key={reply.id} className="bg-canvas p-3 rounded-lg border border-line">
                  <div className="flex items-center gap-2 mb-2">
                    
                    {/* HAMESHA ICON.PNG AUR ADMINISTRATION SHOW HOGA */}
                    <img 
                      src="/images/brand/icon.png" 
                      alt="Administration" 
                      className="w-6 h-6 rounded-full object-contain bg-white p-0.5" 
                    />
                    <p className="text-xs font-bold text-ink">Administration</p>
                    
                    <span className="text-[10px] text-mist ml-auto">
                      {new Date(reply.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm text-mist pl-8">{reply.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}