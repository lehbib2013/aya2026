import getDb from "@/lib/db";
import Link from "next/link";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(n) + " MAD";
}

function pct(a: number, b: number) {
  if (b === 0) return "—";
  return ((a / b) * 100).toFixed(1) + "%";
}

export default function JournalPage() {
  const db = getDb();
  const journals = db.prepare(`
    SELECT jp.*, m.code as marree_code
    FROM journal_peche jp
    LEFT JOIN marrees m ON jp.marree_id = m.id
    ORDER BY jp.date_jp DESC
  `).all() as any[];

  const allCaptures = db.prepare(`
    SELECT c.*, jp.marree_id, m.code as marree_code
    FROM captures c
    JOIN journal_peche jp ON c.journal_id = jp.id
    JOIN marrees m ON jp.marree_id = m.id
    ORDER BY jp.date_jp DESC
  `).all() as any[];

  // summary per espece
  const byEspece: Record<string, { qte: number; ptSmcp: number; ptCap: number }> = {};
  for (const c of allCaptures) {
    if (!byEspece[c.espece]) byEspece[c.espece] = { qte: 0, ptSmcp: 0, ptCap: 0 };
    byEspece[c.espece].qte    += c.qte;
    byEspece[c.espece].ptSmcp += c.pt_smcp;
    byEspece[c.espece].ptCap  += c.pt_capitaine;
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal de Pêche</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {journals.length} journal(aux) — {allCaptures.length} ligne(s) de capture
          </p>
        </div>
      </div>

      {/* Summary by espece */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(byEspece).map(([espece, data]) => (
          <div key={espece} className="card bg-blue-50 border-0">
            <p className="text-xs text-gray-500 uppercase font-semibold">{espece}</p>
            <p className="text-xl font-bold text-blue-700 mt-1">
              {data.qte.toLocaleString("fr-MA")} kg
            </p>
            <p className="text-xs text-gray-400 mt-0.5">SMCP: {fmt(data.ptSmcp)}</p>
          </div>
        ))}
      </div>

      {/* Journals list */}
      <div className="space-y-4">
        {journals.map((j) => {
          const caps = allCaptures.filter((c) => c.journal_id === j.id);
          const totSmcp = caps.reduce((s, c) => s + c.pt_smcp, 0);
          const totCap  = caps.reduce((s, c) => s + c.pt_capitaine, 0);
          return (
            <div key={j.id} className="card p-0 overflow-hidden">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-800">
                    JP — {j.date_jp ?? j.date_etab}
                  </span>
                  <Link
                    href={`/marrees/${j.marree_id}`}
                    className="ml-3 text-blue-600 hover:underline text-sm"
                  >
                    {j.marree_code}
                  </Link>
                </div>
                <span className={`badge ${j.statut === "validé" ? "badge-green" : "badge-yellow"}`}>
                  {j.statut}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="th">Espèce</th>
                      <th className="th">Qté (kg)</th>
                      <th className="th">P.U. Cap.</th>
                      <th className="th">P.U. SMCP</th>
                      <th className="th">Pt Cap.</th>
                      <th className="th">Pt SMCP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {caps.map((c) => (
                      <tr key={c.id} className="table-row-hover">
                        <td className="td font-medium">{c.espece}</td>
                        <td className="td">{c.qte.toLocaleString("fr-MA")}</td>
                        <td className="td">{c.pu_capitaine}</td>
                        <td className="td">{c.pu_smcp}</td>
                        <td className="td text-blue-600">{fmt(c.pt_capitaine)}</td>
                        <td className="td font-medium text-emerald-700">{fmt(c.pt_smcp)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {caps.length > 0 && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="td text-right font-semibold">Totaux :</td>
                        <td className="td font-bold text-blue-700">{fmt(totCap)}</td>
                        <td className="td font-bold text-emerald-700">{fmt(totSmcp)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          );
        })}
        {journals.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <div className="text-5xl mb-3">📋</div>
            <p>Aucun journal de pêche</p>
          </div>
        )}
      </div>
    </div>
  );
}
