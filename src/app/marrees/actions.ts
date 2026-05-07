"use server";

import { runQuery } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ─── Marées ───────────────────────────────────────────────────────────────────

export async function createMarree(formData: FormData) {
  const code       = formData.get("code") as string;
  const bateau_id  = formData.get("bateau_id")  ? Number(formData.get("bateau_id"))  : null;
  const capitaine_id = formData.get("capitaine_id") ? Number(formData.get("capitaine_id")) : null;
  const date_depart  = formData.get("date_depart")  as string | null;
  const date_retour  = formData.get("date_retour")  as string | null;

  await runQuery(`
    INSERT INTO marrees (code, bateau_id, capitaine_id, date_depart, date_retour)
    VALUES (?, ?, ?, ?, ?)
  `, [code, bateau_id, capitaine_id, date_depart || null, date_retour || null]);

  revalidatePath("/marrees");
}

export async function updateMarreeStatus(id: number, field: string, value: string) {
  const allowed = ["statut_logistique", "statut_tresorerie", "statut_stock"];
  if (!allowed.includes(field)) throw new Error("Champ invalide");
  await runQuery(`UPDATE marrees SET ${field} = ? WHERE id = ?`, [value, id]);
  revalidatePath("/marrees");
  revalidatePath(`/marrees/${id}`);
}

export async function updateMarreeDates(id: number, date_depart: string, date_retour: string) {
  await runQuery(`UPDATE marrees SET date_depart = ?, date_retour = ? WHERE id = ?`,
    [date_depart || null, date_retour || null, id]);
  revalidatePath(`/marrees/${id}`);
}

export async function deleteMarree(id: number) {
  await runQuery(`DELETE FROM marrees WHERE id = ?`, [id]);
  revalidatePath("/marrees");
}

// ─── Dépenses ─────────────────────────────────────────────────────────────────

export async function createDepense(formData: FormData) {
  const marree_id     = Number(formData.get("marree_id"));
  const date_execution= formData.get("date_execution") as string;
  const compte_frais  = formData.get("compte_frais")   as string;
  const part_aya      = Number(formData.get("part_aya")  || 0);
  const part_capitaine= Number(formData.get("part_capitaine") || 0);
  const type_paiement = formData.get("type_paiement")  as string;
  const fournisseur_id= formData.get("fournisseur_id") ? Number(formData.get("fournisseur_id")) : null;
  const facture       = formData.get("facture")        as string | null;
  const objet_depense = formData.get("objet_depense")  as string;
  const type_detail   = formData.get("type_detail")    as string;
  const qte           = Number(formData.get("qte") || 0);
  const pu            = Number(formData.get("pu")  || 0);
  const montant_total = Number(formData.get("montant_total") || (qte * pu));

  await runQuery(`
    INSERT INTO depenses
      (marree_id, date_execution, compte_frais, part_aya, part_capitaine,
       type_paiement, fournisseur_id, facture, objet_depense, type_detail, qte, pu, montant_total)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `, [
    marree_id, date_execution, compte_frais, part_aya, part_capitaine,
    type_paiement, fournisseur_id, facture || null, objet_depense, type_detail, qte, pu, montant_total
  ]);

  // Update total_depenses on maree
  await runQuery(
    `UPDATE marrees SET total_depenses = (SELECT COALESCE(SUM(montant_total),0) FROM depenses WHERE marree_id=?) WHERE id=?`,
    [marree_id, marree_id]
  );

  revalidatePath(`/marrees/${marree_id}`);
}

export async function deleteDepense(id: number, marree_id: number) {
  await runQuery(`DELETE FROM depenses WHERE id = ?`, [id]);
  await runQuery(
    `UPDATE marrees SET total_depenses = (SELECT COALESCE(SUM(montant_total),0) FROM depenses WHERE marree_id=?) WHERE id=?`,
    [marree_id, marree_id]
  );
  revalidatePath(`/marrees/${marree_id}`);
}

// ─── Recettes ─────────────────────────────────────────────────────────────────

export async function createRecette(formData: FormData) {
  const marree_id        = Number(formData.get("marree_id"));
  const date_encaissement= formData.get("date_encaissement") as string;
  const espece           = formData.get("espece")            as string;
  const poids_vendu      = Number(formData.get("poids_vendu") || 0);
  const montant_total    = Number(formData.get("montant_total") || 0);
  const libelle          = formData.get("libelle")           as string;

  await runQuery(`
    INSERT INTO recettes_ventes (marree_id, date_encaissement, espece, poids_vendu, montant_total, libelle)
    VALUES (?,?,?,?,?,?)
  `, [marree_id, date_encaissement, espece, poids_vendu, montant_total, libelle]);

  await runQuery(
    `UPDATE marrees SET total_recettes = (SELECT COALESCE(SUM(montant_total),0) FROM recettes_ventes WHERE marree_id=?) WHERE id=?`,
    [marree_id, marree_id]
  );

  revalidatePath(`/marrees/${marree_id}`);
}

export async function deleteRecette(id: number, marree_id: number) {
  await runQuery(`DELETE FROM recettes_ventes WHERE id = ?`, [id]);
  await runQuery(
    `UPDATE marrees SET total_recettes = (SELECT COALESCE(SUM(montant_total),0) FROM recettes_ventes WHERE marree_id=?) WHERE id=?`,
    [marree_id, marree_id]
  );
  revalidatePath(`/marrees/${marree_id}`);
}

// ─── Journal de pêche & Captures ─────────────────────────────────────────────

export async function createJournal(formData: FormData) {
  const marree_id = Number(formData.get("marree_id"));
  const date_etab = formData.get("date_etab") as string;
  const date_jp   = formData.get("date_jp")   as string;

  await runQuery(`
    INSERT INTO journal_peche (marree_id, date_etab, date_jp, statut)
    VALUES (?, ?, ?, 'brouillon')
  `, [marree_id, date_etab, date_jp]);

  revalidatePath(`/marrees/${marree_id}`);
}

export async function createCapture(formData: FormData) {
  const journal_id   = Number(formData.get("journal_id"));
  const marree_id    = Number(formData.get("marree_id"));
  const espece       = formData.get("espece")       as string;
  const qte          = Number(formData.get("qte")   || 0);
  const pu_capitaine = Number(formData.get("pu_capitaine") || 0);
  const pu_smcp      = Number(formData.get("pu_smcp")      || 0);
  const pt_capitaine = qte * pu_capitaine;
  const pt_smcp      = qte * pu_smcp;

  await runQuery(`
    INSERT INTO captures (journal_id, espece, qte, pu_capitaine, pu_smcp, pt_capitaine, pt_smcp)
    VALUES (?,?,?,?,?,?,?)
  `, [journal_id, espece, qte, pu_capitaine, pu_smcp, pt_capitaine, pt_smcp]);

  revalidatePath(`/marrees/${marree_id}`);
}

export async function deleteCapture(id: number, marree_id: number) {
  await runQuery(`DELETE FROM captures WHERE id = ?`, [id]);
  revalidatePath(`/marrees/${marree_id}`);
}

// ─── Bateaux ──────────────────────────────────────────────────────────────────

export async function createBateau(formData: FormData) {
  const nom          = formData.get("nom")              as string;
  const capitaine_id = formData.get("capitaine_courant") ? Number(formData.get("capitaine_courant")) : null;
  const statut       = formData.get("statut")           as string || "actif";
  const locataire    = formData.get("locataire")        as string | null;

  await runQuery(`INSERT INTO bateaux (nom, capitaine_courant, statut, locataire) VALUES (?,?,?,?)`,
    [nom, capitaine_id, statut, locataire || null]);
  revalidatePath("/bateaux");
}

export async function updateBateau(id: number, formData: FormData) {
  const nom          = formData.get("nom")              as string;
  const capitaine_id = formData.get("capitaine_courant") ? Number(formData.get("capitaine_courant")) : null;
  const statut       = formData.get("statut")           as string;
  const locataire    = formData.get("locataire")        as string | null;

  await runQuery(`UPDATE bateaux SET nom=?, capitaine_courant=?, statut=?, locataire=? WHERE id=?`,
    [nom, capitaine_id, statut, locataire || null, id]);
  revalidatePath("/bateaux");
}

export async function deleteBateau(id: number) {
  await runQuery(`DELETE FROM bateaux WHERE id = ?`, [id]);
  revalidatePath("/bateaux");
}

// ─── Capitaines ───────────────────────────────────────────────────────────────

export async function createCapitaine(formData: FormData) {
  const nom = formData.get("nom") as string;
  await runQuery(`INSERT INTO capitaines (nom) VALUES (?)`, [nom]);
  revalidatePath("/capitaines");
  revalidatePath("/bateaux");
}

export async function updateCapitaine(id: number, formData: FormData) {
  const nom = formData.get("nom") as string;
  await runQuery(`UPDATE capitaines SET nom=? WHERE id=?`, [nom, id]);
  revalidatePath("/capitaines");
}

export async function deleteCapitaine(id: number) {
  await runQuery(`DELETE FROM capitaines WHERE id = ?`, [id]);
  revalidatePath("/capitaines");
}

// ─── Fournisseurs ─────────────────────────────────────────────────────────────

export async function createFournisseur(formData: FormData) {
  const nom = formData.get("nom") as string;
  await runQuery(`INSERT INTO fournisseurs (nom) VALUES (?)`, [nom]);
  revalidatePath("/fournisseurs");
}

export async function updateFournisseur(id: number, formData: FormData) {
  const nom = formData.get("nom") as string;
  await runQuery(`UPDATE fournisseurs SET nom=? WHERE id=?`, [nom, id]);
  revalidatePath("/fournisseurs");
}

export async function deleteFournisseur(id: number) {
  await runQuery(`DELETE FROM fournisseurs WHERE id = ?`, [id]);
  revalidatePath("/fournisseurs");
}
