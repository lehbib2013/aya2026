import getDb from "@/lib/db";
import Link from "next/link";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(n) + " MAD";
}

const COMPTE_COLORS: Record<string, string> = {
  Carburant: "badge-blue",
  Eau:       "badge-blue",
  Nourriture:"badge-green",
  Sardine:   "badge-yellow",
  Glace:     "badge-blue",
  Généraux:  "badge-gray",
  Salaires:  "badge-green",
  Avance:    "badge-yellow",
  PDR:       "badge-red",
  "Règlement Part Capitaine": "badge-green",
  Autres:    "badge-gray",
};

export default function DepensesPage() {
  const db = getDb();
  const depenses = db.prepare(`
    SELECT d.*, m.code as marree_code, f.nom as fournisseur_nom
    FROM depenses d
    LEFT JOIN marrees m ON d.marree_id = m.id
    LEFT JOIN fournisseurs f ON d.fournisseur_id = f.id
    ORDER BY d.date_execution DESC
  `).all() as any[];

  const totalAll = depenses.reduce((s, d) => s + d.montant_total, 0);

  // Group by compte
  const byCompte: Record<string, number> = {};
  for (const d of depenses) {
    byCompte[d.compte_frais] = (byCompte[d.compte_frais] ?? 0) + d.montant_total;
  }
  const sortedComptes = Object.entries(byCompte).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dépenses</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {depenses.length} dépense(s) — Total: {fmt(totalAll)}
          </p>
        </div>
        <Link href="/marrees" className="btn-primary">
          + Ajouter via Marée
        </Link>
      </div>

      {/* Summary by compte */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sortedComptes.map(([compte, total]) => (
          <div key={compte} className="card py-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">{compte}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{fmt(total)}</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${Math.min((total / totalAll) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="section-title">Toutes les dépenses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">Date</th>
                <th className="th">Marée</th>
                <th className="th">Compte</th>
                <th className="th">Objet</th>
                <th className="th">Fournisseur</th>
                <th className="th">Qté</th>
                <th className="th">P.U.</th>
                <th className="th text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {depenses.map((d) => (
                <tr key={d.id} className="table-row-hover">
                  <td className="td text-gray-500">{d.date_execution ?? "—"}</td>
                  <td className="td">
                    <Link href={`/marrees/${d.marree_id}`} className="text-blue-600 hover:underline font-medium">
                      {d.marree_code}
                    </Link>
                  </td>
                  <td className="td">
                    <span className={`badge ${COMPTE_COLORS[d.compte_frais] ?? "badge-gray"}`}>
                      {d.compte_frais}
                    </span>
                  </td>
                  <td className="td">{d.objet_depense ?? "—"}</td>
                  <td className="td">{d.fournisseur_nom ?? "—"}</td>
                  <td className="td">{d.qte}</td>
                  <td className="td">{d.pu}</td>
                  <td className="td text-right font-semibold text-red-600">{fmt(d.montant_total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={7} className="td text-right font-semibold">Total général :</td>
                <td className="td text-right font-bold text-red-700 text-base">{fmt(totalAll)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
