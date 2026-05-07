"use client";

import { useState } from "react";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(n) + " MAD";
}

interface Props {
  caisses: any[];
  sessionsMap: Record<number, any[]>;
  transactionsMap: Record<number, any[]>;
}

export default function CaisseClient({ caisses, sessionsMap, transactionsMap }: Props) {
  const [selectedCaisse, setSelectedCaisse]   = useState<any | null>(caisses[0] ?? null);
  const [selectedSession, setSelectedSession] = useState<any | null>(
    caisses[0] ? (sessionsMap[caisses[0].id]?.[0] ?? null) : null
  );

  const sessions     = selectedCaisse ? (sessionsMap[selectedCaisse.id] ?? []) : [];
  const transactions = selectedSession ? (transactionsMap[selectedSession.id] ?? []) : [];

  const totalEntrees = transactions
    .filter((t) => t.type === "entree")
    .reduce((s, t) => s + t.montant, 0);
  const totalSorties = transactions
    .filter((t) => t.type === "sortie")
    .reduce((s, t) => s + t.montant, 0);
  const solde = totalEntrees - totalSorties;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caisse</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestion des flux de trésorerie</p>
        </div>
      </div>

      {/* Caisse selector */}
      <div className="flex flex-wrap gap-3">
        {caisses.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedCaisse(c);
              const sess = sessionsMap[c.id]?.[0] ?? null;
              setSelectedSession(sess);
            }}
            className={`px-5 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
              selectedCaisse?.id === c.id
                ? "border-blue-600 bg-blue-600 text-white shadow-md"
                : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
            }`}
          >
            🏧 {c.code}
            <span className="ml-2 text-xs opacity-75">{c.caissier}</span>
          </button>
        ))}
      </div>

      {selectedCaisse && (
        <>
          {/* Session selector */}
          <div className="card">
            <h2 className="section-title mb-3">Sessions — {selectedCaisse.code}</h2>
            <div className="flex flex-wrap gap-2">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSession(s)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                    selectedSession?.id === s.id
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {s.date_debut}
                  {s.date_fin ? ` → ${s.date_fin}` : " (en cours)"}
                  {!s.date_fin && (
                    <span className="ml-2 badge badge-green text-[10px]">Active</span>
                  )}
                </button>
              ))}
              {sessions.length === 0 && (
                <p className="text-gray-400 text-sm">Aucune session</p>
              )}
            </div>
          </div>

          {selectedSession && (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="card bg-emerald-50 border-0 text-center">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Entrées</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">{fmt(totalEntrees)}</p>
                </div>
                <div className="card bg-red-50 border-0 text-center">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Sorties</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{fmt(totalSorties)}</p>
                </div>
                <div className={`card border-0 text-center ${solde >= 0 ? "bg-blue-50" : "bg-amber-50"}`}>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Solde</p>
                  <p className={`text-2xl font-bold mt-1 ${solde >= 0 ? "text-blue-700" : "text-amber-700"}`}>
                    {fmt(solde)}
                  </p>
                </div>
              </div>

              {/* Journal table */}
              <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="section-title">
                    Journal de caisse — Session du {selectedSession.date_debut}
                  </h2>
                  <span className="badge badge-blue">{transactions.length} opération(s)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="th">Date</th>
                        <th className="th">Type</th>
                        <th className="th">Libellé</th>
                        <th className="th">Marée</th>
                        <th className="th">Fournisseur</th>
                        <th className="th text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="td text-center text-gray-400 py-8">
                            Aucune transaction
                          </td>
                        </tr>
                      ) : (
                        transactions.map((t) => (
                          <tr key={t.id} className="table-row-hover">
                            <td className="td">{t.date}</td>
                            <td className="td">
                              <span className={`badge ${t.type === "entree" ? "badge-green" : "badge-red"}`}>
                                {t.type === "entree" ? "⬆ Entrée" : "⬇ Sortie"}
                              </span>
                            </td>
                            <td className="td">{t.libelle}</td>
                            <td className="td text-blue-600">{t.marree_code ?? "—"}</td>
                            <td className="td">{t.fournisseur_nom ?? "—"}</td>
                            <td className={`td text-right font-semibold ${
                              t.type === "entree" ? "text-emerald-700" : "text-red-600"
                            }`}>
                              {t.type === "entree" ? "+" : "-"}{fmt(t.montant)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {transactions.length > 0 && (
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={5} className="td text-right font-semibold text-gray-700">Solde :</td>
                          <td className={`td text-right font-bold text-lg ${solde >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                            {fmt(solde)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {caisses.length === 0 && (
        <div className="text-center text-gray-400 py-20">
          <div className="text-5xl mb-3">🏧</div>
          <p>Aucune caisse configurée</p>
        </div>
      )}
    </div>
  );
}
