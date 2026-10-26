import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { updateTeamAction, addTeamMediaAction, deleteTeamMediaAction } from "@/lib/actions/team.actions";

export default async function TeamManagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("teams", "full");
  const { id } = await params;

  const [team, universities] = await Promise.all([
    prisma.team.findUnique({
      where: { id },
      include: {
        competition: true,
        members: { include: { person: true } },
        media: true,
      },
    }),
    prisma.university.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!team) notFound();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/admin/teams" className="text-mist hover:text-ink text-sm">← Back to Teams</Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">{team.name}</h1>
          <p className="text-mist">{team.competition.title}</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_350px]">
        {/* Main Info & Uploads */}
        <div className="space-y-6">
          {/* 👈 WRAPPED ACTION TO VOID */}
          <form action={async (fd: FormData) => { "use server"; await updateTeamAction(team.id, fd); }} className="card p-4 sm:p-6 grid gap-4">
            <h2 className="text-lg font-bold border-b border-line pb-2 mb-2">Team Profile</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Team Name</label>
                <input name="name" className="input" defaultValue={team.name} required />
              </div>
              <div>
                <label className="label">University</label>
                <select name="universityId" className="input" defaultValue={team.universityId || ""}>
                  <option value="">Select University</option>
                  {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Prototype Description</label>
              <textarea name="prototypeDescription" className="input" rows={4} defaultValue={team.prototypeDescription || ""} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Team Logo (Image)</label>
                <input type="file" name="logo" accept="image/*" className="input" style={{ paddingTop: 8 }} />
                {team.logo && <img src={team.logo} className="mt-2 h-12 w-12 rounded-full" alt="logo" />}
              </div>
              <div>
                <label className="label">Design Report (PDF)</label>
                <input type="file" name="reportFile" accept="application/pdf" className="input" style={{ paddingTop: 8 }} />
                {team.reportFile && <a href={team.reportFile} target="_blank" className="text-signal text-sm mt-2 block">View Current Report</a>}
              </div>
              <div>
                <label className="label">Design Poster (PDF/Image)</label>
                <input type="file" name="posterFile" accept="application/pdf,image/*" className="input" style={{ paddingTop: 8 }} />
                {team.posterFile && <a href={team.posterFile} target="_blank" className="text-signal text-sm mt-2 block">View Current Poster</a>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-2">Save Team Details</button>
          </form>

          {/* Media Gallery */}
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg font-bold border-b border-line pb-2 mb-4">Prototype Media (Photos / Videos)</h2>
            
            {/* 👈 WRAPPED ACTION TO VOID */}
            <form action={async (fd: FormData) => { "use server"; await addTeamMediaAction(team.id, fd); }} className="flex flex-col sm:flex-row gap-2 items-end mb-6">
              <div className="flex-1 w-full">
                <label className="label">Upload Media</label>
                <input type="file" name="mediaFiles" multiple accept="image/*,video/*" className="input" required style={{ paddingTop: 8 }} />
              </div>
              <select name="type" className="input w-full sm:w-32">
                <option value="PHOTO">Photo</option>
                <option value="VIDEO">Video</option>
              </select>
              <button type="submit" className="btn btn-primary w-full sm:w-auto">Upload</button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {team.media.map(m => (
                <div key={m.id} className="relative group border border-line rounded-lg overflow-hidden">
                  {m.type === "PHOTO" ? (
                    <img src={m.file} alt="media" className="w-full h-32 object-cover" />
                  ) : (
                    <video src={m.file} className="w-full h-32 object-cover" />
                  )}
                  <form action={async () => { "use server"; await deleteTeamMediaAction(m.id, team.id); }} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                    <button type="submit" className="btn btn-sm btn-outline-light border-danger text-danger">Delete</button>
                  </form>
                </div>
              ))}
              {team.media.length === 0 && <p className="col-span-3 text-mist text-sm">No media uploaded yet.</p>}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <aside className="space-y-6">
          <div className="card p-4 sm:p-6 bg-canvas">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mist mb-4">Team Members ({team.members.length})</h2>
            <div className="space-y-3">
              {team.members.map(m => (
                <div key={m.id} className="flex gap-3 items-center bg-white p-2 rounded border border-line">
                  <div className="w-8 h-8 rounded-full bg-signal text-white flex items-center justify-center text-xs font-bold">
                    {m.person.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-ink">{m.person.name}</p>
                    <p className="text-[10px] text-mist font-mono">{m.person.savdId} · {m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}