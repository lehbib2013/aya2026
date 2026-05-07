import { getAllMarrees } from "@/lib/db";
import Link from "next/link";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(n) + " MAD";
}

function pct(a: number, b: number) {
  if (b === 0) return "—";
  return ((a / b) * 100).toFixed(1) + "%";
}

const STATUT_BADGE: Record<string, string> = {
  en_cours: "badge badge-yellow",
  achevee:  "badge badge-green",
  probleme: "badge badge-red",
};
const STATUT_LABELS: Record<string, string> = {
  en_cours: "En cours",
  achevee:  "Achevée",
  probleme: "Problème",
};

export default function BilanPage() {
  const marrees = getAllMarrees() as any[];

  const grandTotalRec = marrees.reduce((s, m) => s + m.total_recettes, 0);
  const grandTotalDep = marrees.reduce((s, m) => s + m.total_depenses, 0);
  const grandSolde    = grandTotalRec - grandTotalDep;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bilan de Marée</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Vue consolidée de toutes les marées
          </p>
        </div>
      </div>

      {/* Grand totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-emerald-50 border-0">
          <p className="text-xs text-gray-500 uppercase font-semibold">Total Recettes</p>
          <p className="text-3xl font-bold text-emerald-700 mt-2">{fmt(grandTotalRec)}</p>
        </div>
        <div className="card bg-red-50 border-0">
          <p className="text-xs text-gray-500 uppercase font-semibold">Total Dépenses</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{fmt(grandTotalDep)}</p>
        </div>
        <div className={`card border-0 ${grandSolde >= 0 ? "bg-blue-50" : "bg-amber-50"}`}>
          <p className="text-xs text-gray-500 uppercase font-semibold">Résultat Net</p>
          <p className={`text-3xl font-bold mt-2 ${grandSolde >= 0 ? "text-blue-700" : "text-amber-700"}`}>
            {fmt(grandSolde)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Marge: {pct(grandSolde, grandTotalRec)}
          </p>
        </div>
      </div>

      {/* Per marée bilan */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="section-title">Bilan par Marée</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">Code</th>
                <th className="th">Bateau</th>
                <th className="th">Capitaine</th>
                <th className="th">Départ</th>
                <th className="th">Retour</th>
                <th className="th text-right">Recettes</th>
                <th className="th text-right">Dépenses</th>
                <th className="th text-right">Solde</th>
                <th className="th text-right">Marge</th>
                <th className="th">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {marrees.map((m) => {
                const solde = m.total_recettes - m.total_depenses;
                const marge = pct(solde, m.total_recettes);
                return (
                  <tr key={m.id} className="table-row-hover">
                    <td className="td">
                      <Link href={`/marrees/${m.id}`} className="font-semibold text-blue-700 hover:underline">
                        {m.code}
                      </Link>
                    </td>
                    <td className="td">{m.bateau_nom ?? "—"}</td>
                    <td className="td">{m.capitaine_nom ?? "—"}</td>
                    <td className="td text-gray-500">{m.date_depart ?? "—"}</td>
                    <td className="td text-gray-500">{m.date_retour ?? "—"}</td>
                    <td className="td text-right text-emerald-700 font-medium">{fmt(m.total_recettes)}</td>
                    <td className="td text-right text-red-600 font-medium">{fmt(m.total_depenses)}</td>
                    <td className={`td text-right font-bold ${solde >= 0 ? "text-blue-700" : "text-amber-600"}`}>
                      {fmt(solde)}
                    </td>
                    <td className={`td text-right text-sm font-medium ${solde >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {marge}
                    </td>
                    <td className="td">
                      <span className={STATUT_BADGE[m.statut_logistique] ?? "badge badge-gray"}>
                        {STATUT_LABELS[m.statut_logistique] ?? m.statut_logistique}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="td text-right font-semibold text-gray-700">
                  Totaux ({marrees.length} marées) :
                </td>
                <td className="td text-right font-bold text-emerald-700">{fmt(grandTotalRec)}</td>
                <td className="td text-right font-bold text-red-600">{fmt(grandTotalDep)}</td>
                <td className={`td text-right font-bold text-lg ${grandSolde >= 0 ? "text-blue-700" : "text-amber-600"}`}>
                  {fmt(grandSolde)}
                </td>
                <td className="td text-right font-semibold">
                  {pct(grandSolde, grandTotalRec)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
