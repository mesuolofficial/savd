"use client";

import { useActionState, useState } from "react";
import { addRequirementAction, deleteRequirementAction, toggleProgressAction } from "@/lib/actions/progress.actions";
import { Plus, Trash2, FileDown, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// FIXED: Added registration to type
type Team = { id: string; name: string; universityText: string | null; registration: { leaderName: string } | null };
type Req = { id: string; name: string };
type Status = { teamId: string; requirementId: string; done: boolean };

export function ProgressGrid({ 
  competitionId, competitionTitle, teams, requirements, statuses 
}: { 
  competitionId: string, competitionTitle: string, teams: Team[], requirements: Req[], statuses: Status[] 
}) {
  const [state, formAction, pending] = useActionState(addRequirementAction, {} as any);
  const [showAdd, setShowAdd] = useState(false);

  const getStatus = (teamId: string, reqId: string) => {
    return statuses.find(s => s.teamId === teamId && s.requirementId === reqId)?.done || false;
  };

  // --- CSV EXPORT ---
  const handleExportCSV = () => {
    const headers = ["Team Name", "Leader", "University", ...requirements.map(r => r.name)];
    const rows = teams.map(t => [
      t.name, 
      t.registration?.leaderName || "N/A", 
      t.universityText || "",
      ...requirements.map(r => getStatus(t.id, r.id) ? "Done" : "Pending")
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Progress_Report_${competitionTitle.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  // --- PDF EXPORT ---
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text(`Progress Report: ${competitionTitle}`, 14, 22);
    
    // Table
    const head = [["Team Name", "Leader", ...requirements.map(r => r.name)]];
    const body = teams.map(t => [
      t.name,
      t.registration?.leaderName || "N/A",
      ...requirements.map(r => getStatus(t.id, r.id) ? "Done" : "Pending")
    ]);

    autoTable(doc, {
      head: head,
      body: body,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 47, 75] }, // Abyss color
      alternateRowStyles: { fillColor: [246, 243, 236] }, // Card color
    });

    doc.save(`Progress_Report_${competitionTitle.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-8">
      {/* REQUIREMENTS SECTION */}
      <div className="card p-6 bg-canvas border border-line">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-ink">Requirements for this Competition</h2>
          <button onClick={() => setShowAdd(!showAdd)} className="btn btn-sm btn-primary">
            <Plus className="size-4 mr-1" /> Add Requirement
          </button>
        </div>

        {showAdd && (
          <form action={formAction} className="flex gap-2 mb-6 max-w-md bg-white p-4 rounded-lg border border-line shadow-sm">
            <input type="hidden" name="competitionId" value={competitionId} />
            <input name="name" className="input flex-1" placeholder="e.g. Signed Documents" required />
            <button type="submit" className="btn btn-primary" disabled={pending}>Add</button>
          </form>
        )}

        <div className="flex flex-wrap gap-3">
          {requirements.map(r => (
            <div key={r.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-line shadow-sm">
              <span className="font-semibold text-sm text-ink">{r.name}</span>
              <button 
                onClick={async () => {
                  if (confirm(`Delete requirement "${r.name}"? This will remove all team progress for it.`)) {
                    await deleteRequirementAction(r.id, competitionId);
                  }
                }} 
                className="text-danger hover:bg-danger/10 p-1 rounded transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {requirements.length === 0 && <p className="text-sm text-mist">No requirements added yet.</p>}
        </div>
      </div>

      {/* TEAM PROGRESS TABLE */}
      <div className="card p-0 overflow-x-auto border border-line">
        <div className="p-4 bg-[#0f2f4b] text-white flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-lg font-bold">Team Progress (Approved Teams Only)</h2>
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="btn btn-sm bg-white text-ink hover:bg-canvas flex items-center gap-1">
              <FileSpreadsheet className="size-4" /> Export CSV
            </button>
            <button onClick={handleExportPDF} className="btn btn-sm bg-white text-danger hover:bg-canvas flex items-center gap-1">
              <FileDown className="size-4" /> Export PDF
            </button>
          </div>
        </div>
        
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-canvas border-b border-line">
            <tr>
              <th className="p-4 border-r border-line">Team</th>
              <th className="p-4 border-r border-line">Leader</th>
              {requirements.map(r => (
                <th key={r.id} className="p-4 text-center border-r border-line">{r.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.length === 0 ? (
              <tr><td colSpan={requirements.length + 2} className="p-8 text-center text-mist">No approved teams found.</td></tr>
            ) : teams.map(t => (
              <tr key={t.id} className="border-b border-line/50 hover:bg-canvas/30">
                <td className="p-4 border-r border-line">
                  <p className="font-bold text-ink">{t.name}</p>
                </td>
                <td className="p-4 border-r border-line">
                  {/* FIXED: Showing Leader Name */}
                  <p className="text-sm font-semibold text-ink">{t.registration?.leaderName || "N/A"}</p>
                  <p className="text-xs text-mist">{t.universityText}</p>
                </td>
                {requirements.map(r => {
                  const isDone = getStatus(t.id, r.id);
                  return (
                    <td key={r.id} className="p-4 text-center border-r border-line">
                      <button
                        onClick={() => toggleProgressAction(t.id, r.id, isDone, competitionId)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors border ${
                          isDone 
                            ? "bg-success text-white border-success hover:bg-success/90" 
                            : "bg-canvas text-mist border-line hover:bg-line"
                        }`}
                      >
                        {isDone ? "Done" : "Pending"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}