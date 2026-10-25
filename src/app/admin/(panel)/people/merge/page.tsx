import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { MergeForm } from "@/components/admin/MergeForm";

export default async function MergePeoplePage() {
  await requireAdmin("people", "full");
  const people = await prisma.person.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, savdId: true, email: true } });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6"><Link href="/admin/people" className="text-mist hover:text-ink text-sm">← Back to People</Link></div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Merge People</h1>
      <MergeForm people={people} />
    </div>
  );
}