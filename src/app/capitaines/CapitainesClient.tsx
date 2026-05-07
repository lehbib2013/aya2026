"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { createCapitaine, updateCapitaine, deleteCapitaine } from "../marrees/actions";

interface Props {
  capitaines: any[];
}

export default function CapitainesClient({ capitaines }: Props) {
  const [showAdd,  setShowAdd]  = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createCapitaine(new FormData(e.currentTarget));
    setShowAdd(false);
    window.location.reload();
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await updateCapitaine(editItem.id, new FormData(e.currentTarget));
    setEditItem(null);
    window.location.reload();
  }

  async function handleDelete(id: number, nom: string) {
    if (!confirm(`Supprimer le capitaine "${nom}" ?`)) return;
    await deleteCapitaine(id);
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capitaines</h1>
          <p className="text-gray-500 text-sm mt-0.5">{capitaines.length} capitaine(s)</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">+ Nouveau Capitaine</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {capitaines.map((c) => (
          <div key={c.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-lg shadow">
                {c.nom?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{c.nom}</h3>
                <p className="text-xs text-gray-500">Capitaine N° {c.id}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => setEditItem(c)} className="flex-1 btn-secondary text-xs justify-center">
                Modifier
              </button>
              <button onClick={() => handleDelete(c.id, c.nom)} className="btn-danger">
                Suppr.
              </button>
            </div>
          </div>
        ))}
        {capitaines.length === 0 && (
          <div className="col-span-4 text-center text-gray-400 py-12">
            Aucun capitaine enregistré
          </div>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="section-title">Liste des capitaines</h2>
          <span className="badge badge-blue">{capitaines.length} total</span>
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
              {capitaines.map((c) => (
                <tr key={c.id} className="table-row-hover">
                  <td className="td text-gray-400">{c.id}</td>
                  <td className="td font-medium">{c.nom}</td>
                  <td className="td">
                    <div className="flex gap-2">
                      <button onClick={() => setEditItem(c)} className="btn-secondary text-xs">Modifier</button>
                      <button onClick={() => handleDelete(c.id, c.nom)} className="btn-danger">Suppr.</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nouveau Capitaine">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="form-label">Nom du capitaine *</label>
            <input name="nom" required className="form-input" placeholder="Prénom Nom" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Modifier le Capitaine">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="form-label">Nom du capitaine *</label>
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
