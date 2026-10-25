"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function ReviewFilters({ competitions }: { competitions: { id: string, title: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentComp = searchParams.get("comp") || "";
  const currentRole = searchParams.get("role") || "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/reviews?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      <select 
        className="input" 
        style={{ height: 44, width: 180 }}
        value={currentComp}
        onChange={(e) => updateFilter("comp", e.target.value)}
      >
        <option value="">All Competitions</option>
        {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>
      
      <select 
        className="input" 
        style={{ height: 44, width: 150 }}
        value={currentRole}
        onChange={(e) => updateFilter("role", e.target.value)}
      >
        <option value="">All Roles</option>
        <option value="PARTICIPANT">Participant</option>
        <option value="ORGANIZER">Organizer</option>
        <option value="JUDGE">Judge</option>
        <option value="GUEST">Guest</option>
      </select>
    </div>
  );
}