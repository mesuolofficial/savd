"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PostReviewForm({ competitions }: { competitions: { id: string, title: string, slug: string }[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState("");

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const comp = competitions.find(c => c.id === selected);
    if (comp) router.push(`/reviews/post/${comp.slug}`);
  };

  return (
    <form onSubmit={handleContinue} className="card p-8 bg-white border border-line">
      <div className="mb-6">
        <label className="label">Competition</label>
        <select className="input" value={selected} onChange={e => setSelected(e.target.value)} required>
          <option value="">-- Select Competition --</option>
          {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>
      <button type="submit" className="btn b1 w-full justify-center">Continue</button>
    </form>
  );
}