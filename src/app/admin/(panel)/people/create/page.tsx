import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PersonForm } from "@/components/admin/PersonForm";
import { createPersonAction } from "@/lib/actions/person.actions";

export default async function CreatePersonPage() {
  await requireAdmin("people", "full");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/people" className="text-mist hover:text-ink text-sm">← Back to directory</Link>
      </div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Add New Person</h1>
      <PersonForm action={createPersonAction} />
    </div>
  );
}