import KpiCard from "@/components/KpiCard";
import { getDashboardKpis, getRecentMarrees } from "@/lib/db";
import Link from "next/link";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(n) + " MAD";
}

function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string, string> = {
    achevee:  "badge badge-green",
    en_cours: "badge badge-yellow",
    probleme: "badge badge-red",
  };
  const labelMap: Record<string, string> = {
    achevee:  "Achevée",
    en_cours: "En cours",
    probleme: "Problème",
  };
  return (
    <span className={map[statut] ?? "badge badge-gray"}>
      {labelMap[statut] ?? statut}
    </span>
  );
}

export default async function DashboardPage() {
  const kpis = await getDashboardKpis();
  const recentMarrees = await getRecentMarrees(6) as any[];

  const solde = kpis.totalRecettes - kpis.totalDepenses;
  const marge = kpis.totalRecettes > 0
    ? ((solde / kpis.totalRecettes) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Vue d&apos;ensemble — AYA PÊCHE
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/marrees" className="btn-primary">
            ⚓ Nouvelle Marée
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Marées"
          value={kpis.totalMarrees}
          subtitle={`${kpis.activeMarrees} en cours`}
          icon="⚓"
          color="blue"
          trend={{ value: "actives", up: true }}
        />
        <KpiCard
          title="Recettes Totales"
          value={fmt(kpis.totalRecettes)}
          subtitle="Toutes marées confondues"
          icon="💰"
          color="green"
        />
        <KpiCard
          title="Dépenses Totales"
          value={fmt(kpis.totalDepenses)}
          subtitle="Charges opérationnelles"
          icon="💸"
          color="amber"
        />
        <KpiCard
          title="Solde Caisse"
          value={fmt(kpis.soldeCaisse)}
          subtitle={`Marge: ${marge}%`}
          icon="🏧"
          color={kpis.soldeCaisse >= 0 ? "green" : "red"}
        />
      </div>

      {/* Charts + Activity row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart placeholder */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Performance des Marées</h2>
            <span className="badge badge-blue">6 derniers mois</span>
          </div>
          <div className="shimmer rounded-xl h-48 flex items-center justify-center text-gray-400 text-sm">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p>Graphique des recettes / dépenses</p>
              <p className="text-xs text-gray-400 mt-1">
                Intégrer Chart.js ou Recharts
              </p>
            </div>
          </div>
          {/* Mini bar preview */}
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[
              { label: "Mar-001", rec: 185000, dep: 62000 },
              { label: "Mar-002", rec: 210000, dep: 74500 },
              { label: "Mar-003", rec: 0,      dep: 18000 },
              { label: "Mar-004", rec: 95000,  dep: 31000 },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <div className="flex flex-col-reverse h-16 gap-0.5 items-center justify-start">
                  <div
                    className="w-5 bg-red-300 rounded-t"
                    style={{ height: `${Math.min((m.dep / 250000) * 64, 64)}px` }}
                  />
                  <div
                    className="w-5 bg-blue-500 rounded-t"
                    style={{ height: `${Math.min((m.rec / 250000) * 64, 64)}px` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 className="section-title mb-4">Actions rapides</h2>
          <div className="space-y-2">
            {[
              { href: "/marrees",      icon: "⚓", label: "Nouvelle Marée",     color: "bg-blue-600" },
              { href: "/bateaux",      icon: "🚢", label: "Gérer les Bateaux",  color: "bg-cyan-600"  },
              { href: "/caisse",       icon: "🏧", label: "Ouvrir la Caisse",   color: "bg-emerald-600"},
              { href: "/fournisseurs", icon: "🏭", label: "Fournisseurs",        color: "bg-purple-600"},
              { href: "/capitaines",   icon: "👨‍✈️", label: "Capitaines",         color: "bg-amber-600" },
              { href: "/bilan",        icon: "📊", label: "Bilan Général",       color: "bg-rose-600"  },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div
                  className={`w-9 h-9 rounded-lg ${a.color} flex items-center justify-center text-white text-base shadow-sm`}
                >
                  {a.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {a.label}
                </span>
                <span className="ml-auto text-gray-300 group-hover:text-gray-500 text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent marées table */}
      <div className="card">
        <div className="page-header">
          <h2 className="section-title">Marées Récentes</h2>
          <Link href="/marrees" className="btn-secondary text-xs">
            Voir tout →
          </Link>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">Code</th>
                <th className="th">Bateau</th>
                <th className="th">Capitaine</th>
                <th className="th">Départ</th>
                <th className="th">Retour</th>
                <th className="th">Recettes</th>
                <th className="th">Dépenses</th>
                <th className="th">Statut Log.</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {recentMarrees.map((m) => (
                <tr key={m.id} className="table-row-hover">
                  <td className="td font-semibold text-blue-700">{m.code}</td>
                  <td className="td">{m.bateau_nom ?? "—"}</td>
                  <td className="td">{m.capitaine_nom ?? "—"}</td>
                  <td className="td text-gray-500">{m.date_depart ?? "—"}</td>
                  <td className="td text-gray-500">{m.date_retour ?? "—"}</td>
                  <td className="td text-emerald-700 font-medium">{fmt(m.total_recettes)}</td>
                  <td className="td text-red-600 font-medium">{fmt(m.total_depenses)}</td>
                  <td className="td">
                    <StatusBadge statut={m.statut_logistique} />
                  </td>
                  <td className="td">
                    <Link
                      href={`/marrees/${m.id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Détail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active marée highlight */}
      {kpis.activeMarrees > 0 && (
        <div className="card bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
              ⚓
            </div>
            <div>
              <p className="text-blue-100 text-sm">Marées actives en ce moment</p>
              <p className="text-3xl font-bold">{kpis.activeMarrees}</p>
            </div>
            <div className="ml-auto">
              <Link
                href="/marrees"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                Voir les marées actives →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
