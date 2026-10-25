import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Notice } from "@/components/admin/Notice";
import { addUniversityAction, renameUniversityAction, deleteUniversityAction } from "@/lib/actions/reference.actions";

export default async function UniversitiesAdminPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireAdmin("universities", "full");
  const { msg } = await searchParams;
  const unis = await prisma.university.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { teams: true } } } });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink mb-6">Universities</h1>
      {msg === "saved" && <Notice kind="ok">Saved successfully.</Notice>}
      {msg === "exists" && <Notice kind="error">This university name already exists.</Notice>}
      {msg === "in-use" && <Notice kind="error">Cannot delete: teams are using this university.</Notice>}

      <form action={addUniversityAction} className="card p-4 mb-8 grid gap-4 items-end grid-cols-1 md:grid-cols-[1fr_1fr_auto]">
        <div><label className="label">University Name</label><input name="name" className="input" required /></div>
        <div><label className="label">Logo (optional)</label><input type="file" name="logo" accept="image/*" className="input" style={{ paddingTop: 8 }} /></div>
        <button type="submit" className="btn btn-primary">Add University</button>
      </form>

      <div className="grid gap-4">
        {unis.map((u) => (
          <form key={u.id} action={renameUniversityAction} className="card p-4 grid gap-4 items-end grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] bg-white">
            <input type="hidden" name="id" value={u.id} />
            <div className="flex items-center gap-3">
              {u.logo ? <img src={u.logo} className="w-8 h-8 object-contain" /> : <div className="w-8 h-8 bg-canvas rounded-full" />}
              <input name="name" className="input" defaultValue={u.name} required />
            </div>
            <div><input type="file" name="logo" accept="image/*" className="input" style={{ paddingTop: 8 }} /></div>
            <button type="submit" className="btn btn-outline-light">Save</button>
            <button formAction={deleteUniversityAction} disabled={u._count.teams > 0} className="btn text-danger hover:bg-danger/10 disabled:opacity-50">Delete</button>
          </form>
        ))}
      </div>
    </div>
  );
}