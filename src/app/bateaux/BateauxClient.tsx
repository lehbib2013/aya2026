"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { createBateau, updateBateau, deleteBateau } from "../marrees/actions";

const STATUTS = ["actif", "maintenance", "inactif"] as const;
const STATUT_BADGE: Record<string, string> = {
  actif:       "badge badge-green",
  maintenance: "badge badge-yellow",
  inactif:     "badge badge-gray",
};

interface Props {
  bateaux: any[];
  capitaines: any[];
}

export default function BateauxClient({ bateaux, capitaines }: Props) {
  const [showAdd,  setShowAdd]  = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createBateau(new FormData(e.currentTarget));
    setShowAdd(false);
    window.location.reload();
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await updateBateau(editItem.id, new FormData(e.currentTarget));
    setEditItem(null);
    window.location.reload();
  }

  async function handleDelete(id: number, nom: string) {
    if (!confirm(`Supprimer le bateau "${nom}" ?`)) return;
    await deleteBateau(id);
    window.location.reload();
  }

  const BateauForm = ({ defaultValues }: { defaultValues?: any }) => (
    <div className="space-y-4">
      <div>
        <label className="form-label">Nom du bateau *</label>
        <input name="nom" required defaultValue={defaultValues?.nom} className="form-input" />
      </div>
      <div>
        <label className="form-label">Capitaine courant</label>
        <select name="capitaine_courant" defaultValue={defaultValues?.capitaine_courant ?? ""} className="form-input">
          <option value="">— Aucun —</option>
          {capitaines.map((c: any) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="form-label">Statut</label>
        <select name="statut" defaultValue={defaultValues?.statut ?? "actif"} className="form-input">
          {STATUTS.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="form-label">Locataire</label>
        <input name="locataire" defaultValue={defaultValues?.locataire ?? ""} className="form-input"
          placeholder="Nom du locataire si applicable" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bateaux</h1>
          <p className="text-gray-500 text-sm mt-0.5">{bateaux.length} bateau(x) enregistré(s)</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">+ Nouveau Bateau</button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {bateaux.map((b) => (
          <div key={b.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl">
                🚢
              </div>
              <span className={STATUT_BADGE[b.statut] ?? "badge badge-gray"}>
                {b.statut}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{b.nom}</h3>
            <p className="text-sm text-gray-500 mt-1">
              👨‍✈️ {b.capitaine_nom ?? "Pas de capitaine"}
            </p>
            {b.locataire && (
              <p className="text-xs text-purple-600 mt-1">🏢 {b.locataire}</p>
            )}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setEditItem(b)}
                className="flex-1 btn-secondary text-xs justify-center"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(b.id, b.nom)}
                className="btn-danger"
              >
                Suppr.
              </button>
            </div>
          </div>
        ))}
        {bateaux.length === 0 && (
          <div className="col-span-4 text-center text-gray-400 py-12">
            Aucun bateau enregistré
          </div>
        )}
      </div>

      {/* Table view */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="section-title">Vue tableau</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">Nom</th>
                <th className="th">Capitaine</th>
                <th className="th">Statut</th>
                <th className="th">Locataire</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {bateaux.map((b) => (
                <tr key={b.id} className="table-row-hover">
                  <td className="td font-semibold">{b.nom}</td>
                  <td className="td">{b.capitaine_nom ?? "—"}</td>
                  <td className="td">
                    <span className={STATUT_BADGE[b.statut] ?? "badge badge-gray"}>{b.statut}</span>
                  </td>
                  <td className="td">{b.locataire ?? "—"}</td>
                  <td className="td">
                    <div className="flex gap-2">
                      <button onClick={() => setEditItem(b)} className="btn-secondary text-xs">Modifier</button>
                      <button onClick={() => handleDelete(b.id, b.nom)} className="btn-danger">Suppr.</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nouveau Bateau">
        <form onSubmit={handleAdd} className="space-y-4">
          <BateauForm />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Modifier le Bateau">
        <form onSubmit={handleEdit} className="space-y-4">
          <BateauForm defaultValues={editItem} />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditItem(null)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
