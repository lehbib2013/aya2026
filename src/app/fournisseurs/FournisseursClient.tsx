"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { createFournisseur, updateFournisseur, deleteFournisseur } from "../marrees/actions";

interface Props {
  fournisseurs: any[];
}

export default function FournisseursClient({ fournisseurs }: Props) {
  const [showAdd,  setShowAdd]  = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createFournisseur(new FormData(e.currentTarget));
    setShowAdd(false);
    window.location.reload();
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await updateFournisseur(editItem.id, new FormData(e.currentTarget));
    setEditItem(null);
    window.location.reload();
  }

  async function handleDelete(id: number, nom: string) {
    if (!confirm(`Supprimer le fournisseur "${nom}" ?`)) return;
    await deleteFournisseur(id);
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-gray-500 text-sm mt-0.5">{fournisseurs.length} fournisseur(s)</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">+ Nouveau Fournisseur</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {fournisseurs.map((f) => (
          <div key={f.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow">
                🏭
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{f.nom}</h3>
                <p className="text-xs text-gray-500">Fournisseur N° {f.id}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => setEditItem(f)} className="flex-1 btn-secondary text-xs justify-center">
                Modifier
              </button>
              <button onClick={() => handleDelete(f.id, f.nom)} className="btn-danger">
                Suppr.
              </button>
            </div>
          </div>
        ))}
        {fournisseurs.length === 0 && (
          <div className="col-span-4 text-center text-gray-400 py-12">Aucun fournisseur</div>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="section-title">Liste des fournisseurs</h2>
          <span className="badge badge-purple" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
            {fournisseurs.length} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th">#</th>
                <th className="th">Nom</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {fournisseurs.map((f) => (
                <tr key={f.id} className="table-row-hover">
                  <td className="td text-gray-400">{f.id}</td>
                  <td className="td font-medium">{f.nom}</td>
                  <td className="td">
                    <div className="flex gap-2">
                      <button onClick={() => setEditItem(f)} className="btn-secondary text-xs">Modifier</button>
                      <button onClick={() => handleDelete(f.id, f.nom)} className="btn-danger">Suppr.</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nouveau Fournisseur">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="form-label">Nom du fournisseur *</label>
            <input name="nom" required className="form-input" placeholder="Raison sociale…" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Modifier le Fournisseur">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="form-label">Nom du fournisseur *</label>
            <input name="nom" required defaultValue={editItem?.nom} className="form-input" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditItem(null)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
