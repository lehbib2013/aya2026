"use client";

import { useState } from "react";
import Link from "next/link";
import Modal from "@/components/Modal";
import {
  createDepense,
  deleteDepense,
  createRecette,
  deleteRecette,
  createJournal,
  createCapture,
  deleteCapture,
} from "../actions";

const COMPTES_FRAIS = [
  "Carburant", "Eau", "Nourriture", "Sardine", "Glace",
  "Généraux", "Salaires", "Avance", "PDR",
  "Règlement Part Capitaine", "Autres",
];
const ESPECES = ["Poulpe", "PG", "PF", "PR", "Rejets"];

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

function fmt(n: number) {
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(n) + " MAD";
}

interface Props {
  marree: any;
  depenses: any[];
  journals: any[];
  capturesMap: Record<number, any[]>;
  recettes: any[];
  fournisseurs: any[];
}

type Tab = "consommables" | "pdr" | "generaux" | "journal" | "recettes" | "avances";

const TABS: { key: Tab; label: string }[] = [
  { key: "consommables", label: "Consommables" },
  { key: "pdr",          label: "P.D.R." },
  { key: "generaux",     label: "Frais Généraux" },
  { key: "journal",      label: "Journal Pêche" },
  { key: "recettes",     label: "Recettes" },
  { key: "avances",      label: "Avances" },
];

const TAB_COMPTES: Record<Tab, string[]> = {
  consommables: ["Carburant", "Eau", "Nourriture", "Sardine", "Glace"],
  pdr:          ["PDR"],
  generaux:     ["Généraux", "Salaires", "Autres"],
  journal:      [],
  recettes:     [],
  avances:      ["Avance", "Règlement Part Capitaine"],
};

export default function MarreeDetailClient({
  marree,
  depenses,
  journals,
  capturesMap,
  recettes,
  fournisseurs,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("consommables");
  const [showDepModal, setShowDepModal]   = useState(false);
  const [showRecModal, setShowRecModal]   = useState(false);
  const [showJpModal,  setShowJpModal]    = useState(false);
  const [showCapModal, setShowCapModal]   = useState<number | null>(null); // journal id
  const [depQte, setDepQte] = useState(0);
  const [depPu,  setDepPu]  = useState(0);

  const id = marree.id;

  const solde      = marree.total_recettes - marree.total_depenses;
  const totalCaps  = Object.values(capturesMap).flat();
  const totalSmcp  = totalCaps.reduce((s, c) => s + (c.pt_smcp ?? 0), 0);

  async function handleDepense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createDepense(fd);
    setShowDepModal(false);
    window.location.reload();
  }

  async function handleRecette(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createRecette(new FormData(e.currentTarget));
    setShowRecModal(false);
    window.location.reload();
  }

  async function handleJournal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createJournal(new FormData(e.currentTarget));
    setShowJpModal(false);
    window.location.reload();
  }

  async function handleCapture(e: React.FormEvent<HTMLFormElement>, jid: number) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createCapture(fd);
    setShowCapModal(null);
    window.location.reload();
  }

  // Filter depenses by tab
  const filteredDeps = depenses.filter((d) => {
    const comptes = TAB_COMPTES[activeTab];
    return comptes.length > 0 && comptes.includes(d.compte_frais);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/marrees" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Retour
        </Link>
        <div className="h-4 w-px bg-gray-300" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{marree.code}</h1>
          <p className="text-gray-500 text-sm">
            {marree.bateau_nom ?? "—"} · {marree.capitaine_nom ?? "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={STATUT_BADGE[marree.statut_logistique] ?? "badge badge-gray"}>
            Log: {STATUT_LABELS[marree.statut_logistique]}
          </span>
          <span className={STATUT_BADGE[marree.statut_tresorerie] ?? "badge badge-gray"}>
            Trés: {STATUT_LABELS[marree.statut_tresorerie]}
          </span>
        </div>
      </div>

      {/* Bilan Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-emerald-50 border-0">
          <p className="text-xs text-gray-500 uppercase font-semibold">Recettes</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{fmt(marree.total_recettes)}</p>
        </div>
        <div className="card bg-red-50 border-0">
          <p className="text-xs text-gray-500 uppercase font-semibold">Dépenses</p>
          <p className="text-xl font-bold text-red-600 mt-1">{fmt(marree.total_depenses)}</p>
        </div>
        <div className={`card border-0 ${solde >= 0 ? "bg-blue-50" : "bg-amber-50"}`}>
          <p className="text-xs text-gray-500 uppercase font-semibold">Solde</p>
          <p className={`text-xl font-bold mt-1 ${solde >= 0 ? "text-blue-700" : "text-amber-700"}`}>
            {fmt(solde)}
          </p>
        </div>
        <div className="card bg-purple-50 border-0">
          <p className="text-xs text-gray-500 uppercase font-semibold">Total SMCP</p>
          <p className="text-xl font-bold text-purple-700 mt-1">{fmt(totalSmcp)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-0 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === t.key
                  ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── Depenses tabs ── */}
          {["consommables", "pdr", "generaux", "avances"].includes(activeTab) && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">
                  {TABS.find((t) => t.key === activeTab)?.label}
                </h3>
                <button
                  onClick={() => setShowDepModal(true)}
                  className="btn-primary text-xs"
                >
                  + Ajouter
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="th">Date</th>
                      <th className="th">Compte</th>
                      <th className="th">Objet</th>
                      <th className="th">Qté</th>
                      <th className="th">P.U.</th>
                      <th className="th">Montant</th>
                      <th className="th">Fournisseur</th>
                      <th className="th">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredDeps.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="td text-center text-gray-400 py-8">
                          Aucune dépense
                        </td>
                      </tr>
                    ) : (
                      filteredDeps.map((d) => (
                        <tr key={d.id} className="table-row-hover">
                          <td className="td">{d.date_execution ?? "—"}</td>
                          <td className="td">
                            <span className="badge badge-blue">{d.compte_frais}</span>
                          </td>
                          <td className="td">{d.objet_depense ?? "—"}</td>
                          <td className="td">{d.qte}</td>
                          <td className="td">{d.pu}</td>
                          <td className="td font-medium text-red-600">
                            {fmt(d.montant_total)}
                          </td>
                          <td className="td">{d.fournisseur_nom ?? "—"}</td>
                          <td className="td">
                            <button
                              onClick={async () => {
                                if (!confirm("Supprimer cette dépense ?")) return;
                                await deleteDepense(d.id, id);
                                window.location.reload();
                              }}
                              className="btn-danger"
                            >
                              Suppr.
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {filteredDeps.length > 0 && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={5} className="td text-right font-semibold text-gray-700">
                          Total :
                        </td>
                        <td className="td font-bold text-red-700">
                          {fmt(filteredDeps.reduce((s, d) => s + d.montant_total, 0))}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* ── Journal Pêche ── */}
          {activeTab === "journal" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Journal de Pêche</h3>
                <button onClick={() => setShowJpModal(true)} className="btn-primary text-xs">
                  + Nouveau Journal
                </button>
              </div>
              {journals.length === 0 ? (
                <div className="text-center text-gray-400 py-12">Aucun journal de pêche</div>
              ) : (
                journals.map((j) => {
                  const caps = capturesMap[j.id] ?? [];
                  const totalPts = caps.reduce((s, c) => s + (c.pt_smcp ?? 0), 0);
                  return (
                    <div key={j.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-800">
                            JP du {j.date_jp ?? j.date_etab}
                          </span>
                          <span className={`ml-3 badge ${j.statut === "validé" ? "badge-green" : "badge-yellow"}`}>
                            {j.statut}
                          </span>
                        </div>
                        <button
                          onClick={() => setShowCapModal(j.id)}
                          className="btn-secondary text-xs"
                        >
                          + Capture
                        </button>
                      </div>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="th">Espèce</th>
                            <th className="th">Qté (kg)</th>
                            <th className="th">P.U. Cap.</th>
                            <th className="th">P.U. SMCP</th>
                            <th className="th">Pt Cap.</th>
                            <th className="th">Pt SMCP</th>
                            <th className="th">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {caps.map((c) => (
                            <tr key={c.id} className="table-row-hover">
                              <td className="td font-medium">{c.espece}</td>
                              <td className="td">{c.qte}</td>
                              <td className="td">{c.pu_capitaine}</td>
                              <td className="td">{c.pu_smcp}</td>
                              <td className="td text-blue-700">{fmt(c.pt_capitaine)}</td>
                              <td className="td text-emerald-700 font-medium">{fmt(c.pt_smcp)}</td>
                              <td className="td">
                                <button
                                  onClick={async () => {
                                    if (!confirm("Supprimer ?")) return;
                                    await deleteCapture(c.id, id);
                                    window.location.reload();
                                  }}
                                  className="btn-danger"
                                >
                                  Suppr.
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        {caps.length > 0 && (
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td colSpan={5} className="td text-right font-semibold">Total SMCP :</td>
                              <td className="td font-bold text-emerald-700">{fmt(totalPts)}</td>
                              <td />
                            </tr>
                          </tfoot>
                        )}
                      </table>
                      {/* Add capture modal for this journal */}
                      <Modal
                        isOpen={showCapModal === j.id}
                        onClose={() => setShowCapModal(null)}
                        title="Ajouter une capture"
                      >
                        <form onSubmit={(e) => handleCapture(e, j.id)} className="space-y-4">
                          <input type="hidden" name="journal_id" value={j.id} />
                          <input type="hidden" name="marree_id"  value={id} />
                          <div>
                            <label className="form-label">Espèce</label>
                            <select name="espece" required className="form-input">
                              {ESPECES.map((e) => <option key={e}>{e}</option>)}
                            </select>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="form-label">Quantité (kg)</label>
                              <input name="qte" type="number" step="0.01" required className="form-input" />
                            </div>
                            <div>
                              <label className="form-label">P.U. Capitaine</label>
                              <input name="pu_capitaine" type="number" step="0.01" className="form-input" />
                            </div>
                            <div>
                              <label className="form-label">P.U. SMCP</label>
                              <input name="pu_smcp" type="number" step="0.01" className="form-input" />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowCapModal(null)} className="btn-secondary">
                              Annuler
                            </button>
                            <button type="submit" className="btn-primary">Enregistrer</button>
                          </div>
                        </form>
                      </Modal>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── Recettes ── */}
          {activeTab === "recettes" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Recettes de Vente</h3>
                <button onClick={() => setShowRecModal(true)} className="btn-primary text-xs">
                  + Ajouter
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="th">Date</th>
                      <th className="th">Espèce</th>
                      <th className="th">Poids vendu (kg)</th>
                      <th className="th">Montant</th>
                      <th className="th">Libellé</th>
                      <th className="th">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {recettes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="td text-center text-gray-400 py-8">
                          Aucune recette
                        </td>
                      </tr>
                    ) : (
                      recettes.map((r) => (
                        <tr key={r.id} className="table-row-hover">
                          <td className="td">{r.date_encaissement}</td>
                          <td className="td font-medium">{r.espece}</td>
                          <td className="td">{r.poids_vendu} kg</td>
                          <td className="td font-medium text-emerald-700">{fmt(r.montant_total)}</td>
                          <td className="td text-gray-500">{r.libelle}</td>
                          <td className="td">
                            <button
                              onClick={async () => {
                                if (!confirm("Supprimer ?")) return;
                                await deleteRecette(r.id, id);
                                window.location.reload();
                              }}
                              className="btn-danger"
                            >
                              Suppr.
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {recettes.length > 0 && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="td text-right font-semibold">Total :</td>
                        <td className="td font-bold text-emerald-700">
                          {fmt(recettes.reduce((s, r) => s + r.montant_total, 0))}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Depense Modal */}
      <Modal isOpen={showDepModal} onClose={() => setShowDepModal(false)} title="Ajouter une dépense" size="xl">
        <form onSubmit={handleDepense} className="space-y-4">
          <input type="hidden" name="marree_id" value={id} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Date d&apos;exécution</label>
              <input name="date_execution" type="date" className="form-input" />
            </div>
            <div>
              <label className="form-label">Compte de frais *</label>
              <select name="compte_frais" required className="form-input">
                {COMPTES_FRAIS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Objet de la dépense</label>
            <input name="objet_depense" className="form-input" placeholder="Description…" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">Quantité</label>
              <input
                name="qte"
                type="number"
                step="0.01"
                className="form-input"
                value={depQte}
                onChange={(e) => setDepQte(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="form-label">Prix unitaire</label>
              <input
                name="pu"
                type="number"
                step="0.01"
                className="form-input"
                value={depPu}
                onChange={(e) => setDepPu(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="form-label">Montant total</label>
              <input
                name="montant_total"
                type="number"
                step="0.01"
                className="form-input"
                value={depQte * depPu || 0}
                readOnly
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Part AYA</label>
              <input name="part_aya" type="number" step="0.01" className="form-input" />
            </div>
            <div>
              <label className="form-label">Part Capitaine</label>
              <input name="part_capitaine" type="number" step="0.01" className="form-input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Type de paiement</label>
              <select name="type_paiement" className="form-input">
                <option value="espèces">Espèces</option>
                <option value="virement">Virement</option>
                <option value="chèque">Chèque</option>
              </select>
            </div>
            <div>
              <label className="form-label">Fournisseur</label>
              <select name="fournisseur_id" className="form-input">
                <option value="">— Aucun —</option>
                {fournisseurs.map((f) => (
                  <option key={f.id} value={f.id}>{f.nom}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowDepModal(false)} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </Modal>

      {/* Recette Modal */}
      <Modal isOpen={showRecModal} onClose={() => setShowRecModal(false)} title="Ajouter une recette">
        <form onSubmit={handleRecette} className="space-y-4">
          <input type="hidden" name="marree_id" value={id} />
          <div>
            <label className="form-label">Date d&apos;encaissement</label>
            <input name="date_encaissement" type="date" className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Espèce</label>
              <select name="espece" required className="form-input">
                {ESPECES.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Poids vendu (kg)</label>
              <input name="poids_vendu" type="number" step="0.01" className="form-input" />
            </div>
          </div>
          <div>
            <label className="form-label">Montant total (MAD)</label>
            <input name="montant_total" type="number" step="0.01" required className="form-input" />
          </div>
          <div>
            <label className="form-label">Libellé</label>
            <input name="libelle" className="form-input" placeholder="ex: Vente SMCP Lot 001" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowRecModal(false)} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </Modal>

      {/* Journal Modal */}
      <Modal isOpen={showJpModal} onClose={() => setShowJpModal(false)} title="Nouveau Journal de Pêche">
        <form onSubmit={handleJournal} className="space-y-4">
          <input type="hidden" name="marree_id" value={id} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Date d&apos;établissement</label>
              <input name="date_etab" type="date" className="form-input" />
            </div>
            <div>
              <label className="form-label">Date JP</label>
              <input name="date_jp" type="date" className="form-input" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowJpModal(false)} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">Créer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
