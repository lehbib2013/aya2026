"use client";

import { useState } from "react";
import Link from "next/link";
import Modal from "@/components/Modal";
import { createMarree, deleteMarree } from "./actions";

const STATUTS = ["en_cours", "achevee", "probleme"] as const;
const STATUT_LABELS: Record<string, string> = {
  en_cours: "En cours",
  achevee:  "Achevée",
  probleme: "Problème",
};
const STATUT_BADGE: Record<string, string> = {
  en_cours: "badge badge-yellow",
  achevee:  "badge badge-green",
  probleme: "badge badge-red",
};

function fmt(n: number) {
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(n);
}

interface Props {
  marrees: any[];
  bateaux: any[];
  capitaines: any[];
}

export default function MarreesClient({ marrees, bateaux, capitaines }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch]   = useState("");
  const [filterStatut, setFilter] = useState("");

  const filtered = marrees.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.code?.toLowerCase().includes(q) ||
      m.bateau_nom?.toLowerCase().includes(q) ||
      m.capitaine_nom?.toLowerCase().includes(q);
    const matchStatut = !filterStatut || m.statut_logistique === filterStatut;
    return matchSearch && matchStatut;
  });

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createMarree(new FormData(e.currentTarget));
    setShowAdd(false);
    window.location.reload();
  }

  async function handleDelete(id: number, code: string) {
    if (!confirm(`Supprimer la marée "${code}" ?`)) return;
    await deleteMarree(id);
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marées</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {marrees.length} marée(s) enregistrée(s)
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          + Nouvelle Marée
        </button>
      </div>

      {/* Filters */}
      <div className="card py-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Rechercher (code, bateau, capitaine)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input max-w-xs"
        />
        <select
          value={filterStatut}
          onChange={(e) => setFilter(e.target.value)}
          className="form-input max-w-[180px]"
        >
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => (
            <option key={s} value={s}>{STATUT_LABELS[s]}</option>
          ))}
        </select>
        <span className="text-sm text-gray-400">{filtered.length} résultat(s)</span>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">Code</th>
                <th className="th">Bateau</th>
                <th className="th">Capitaine</th>
                <th className="th">Départ</th>
                <th className="th">Retour</th>
                <th className="th">Recettes (MAD)</th>
                <th className="th">Dépenses (MAD)</th>
                <th className="th">Statut Log.</th>
                <th className="th">Statut Trés.</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="td text-center text-gray-400 py-12">
                    Aucune marée trouvée
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const solde = m.total_recettes - m.total_depenses;
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
                      <td className="td text-emerald-700 font-medium">{fmt(m.total_recettes)}</td>
                      <td className="td text-red-600 font-medium">{fmt(m.total_depenses)}</td>
                      <td className="td">
                        <span className={STATUT_BADGE[m.statut_logistique] ?? "badge badge-gray"}>
                          {STATUT_LABELS[m.statut_logistique] ?? m.statut_logistique}
                        </span>
                      </td>
                      <td className="td">
                        <span className={STATUT_BADGE[m.statut_tresorerie] ?? "badge badge-gray"}>
                          {STATUT_LABELS[m.statut_tresorerie] ?? m.statut_tresorerie}
                        </span>
                      </td>
                      <td className="td">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/marrees/${m.id}`}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded bg-blue-50 hover:bg-blue-100"
                          >
                            Détail
                          </Link>
                          <button
                            onClick={() => handleDelete(m.id, m.code)}
                            className="btn-danger"
                          >
                            Suppr.
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Nouvelle Marée"
        size="lg"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="form-label">Code *</label>
            <input name="code" required className="form-input" placeholder="ex: MAR-2026-005" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Bateau</label>
              <select name="bateau_id" className="form-input">
                <option value="">— Sélectionner —</option>
                {bateaux.map((b) => (
                  <option key={b.id} value={b.id}>{b.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Capitaine</label>
              <select name="capitaine_id" className="form-input">
                <option value="">— Sélectionner —</option>
                {capitaines.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Date de départ</label>
              <input name="date_depart" type="date" className="form-input" />
            </div>
            <div>
              <label className="form-label">Date de retour</label>
              <input name="date_retour" type="date" className="form-input" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              Créer la marée
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
