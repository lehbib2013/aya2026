import getDb from "@/lib/db";
import Link from "next/link";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(n) + " MAD";
}

export default function RecettesPage() {
  const db = getDb();
  const recettes = db.prepare(`
    SELECT r.*, m.code as marree_code
    FROM recettes_ventes r
    LEFT JOIN marrees m ON r.marree_id = m.id
    ORDER BY r.date_encaissement DESC
  `).all() as any[];

  const total = recettes.reduce((s, r) => s + r.montant_total, 0);
  const poidsTotal = recettes.reduce((s, r) => s + r.poids_vendu, 0);

  const byEspece: Record<string, { montant: number; poids: number }> = {};
  for (const r of recettes) {
    if (!byEspece[r.espece]) byEspece[r.espece] = { montant: 0, poids: 0 };
    byEspece[r.espece].montant += r.montant_total;
    byEspece[r.espece].poids   += r.poids_vendu;
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recettes de Vente</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {recettes.length} vente(s) — {poidsTotal.toLocaleString("fr-MA")} kg — {fmt(total)}
          </p>
        </div>
        <Link href="/marrees" className="btn-primary">
          + Ajouter via Marée
        </Link>
      </div>

      {/* By espece */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(byEspece).map(([espece, data]) => (
          <div key={espece} className="card bg-emerald-50 border-0">
            <p className="text-xs text-gray-500 uppercase font-semibold">{espece}</p>
            <p className="text-lg font-bold text-emerald-700 mt-1">{fmt(data.montant)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{data.poids.toLocaleString("fr-MA")} kg</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="section-title">Détail des ventes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">Date</th>
                <th className="th">Marée</th>
                <th className="th">Espèce</th>
                <th className="th">Poids (kg)</th>
                <th className="th">Libellé</th>
                <th className="th text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {recettes.map((r) => (
                <tr key={r.id} className="table-row-hover">
                  <td className="td text-gray-500">{r.date_encaissement}</td>
                  <td className="td">
                    <Link href={`/marrees/${r.marree_id}`} className="text-blue-600 hover:underline font-medium">
                      {r.marree_code}
                    </Link>
                  </td>
                  <td className="td font-medium">{r.espece}</td>
                  <td className="td">{r.poids_vendu.toLocaleString("fr-MA")} kg</td>
                  <td className="td text-gray-500">{r.libelle}</td>
                  <td className="td text-right font-semibold text-emerald-700">{fmt(r.montant_total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="td text-right font-semibold">Totaux :</td>
                <td className="td font-bold">{poidsTotal.toLocaleString("fr-MA")} kg</td>
                <td />
                <td className="td text-right font-bold text-emerald-700 text-base">{fmt(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
