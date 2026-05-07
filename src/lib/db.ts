import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "aya-peche.db");

let db: any = null;
let dbPromise: Promise<any> | null = null;

async function getDb(): Promise<any> {
  if (db) return db;
  if (dbPromise) return dbPromise;
  
  dbPromise = (async () => {
    const initSqlJs = (await import("sql.js")).default;
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    db.run("PRAGMA foreign_keys = ON");
    initializeSchema(db);
    seedData(db);
    saveDb(db);
    return db;
  })();
  
  return dbPromise;
}

function saveDb(database: any) {
  const data = database.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function initializeSchema(database: any) {
  database.run(`
    CREATE TABLE IF NOT EXISTS capitaines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS fournisseurs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bateaux (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      capitaine_courant INTEGER REFERENCES capitaines(id),
      statut TEXT NOT NULL DEFAULT 'actif',
      locataire TEXT
    );
    CREATE TABLE IF NOT EXISTS marrees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      bateau_id INTEGER REFERENCES bateaux(id),
      capitaine_id INTEGER REFERENCES capitaines(id),
      date_depart TEXT,
      date_retour TEXT,
      statut_logistique TEXT NOT NULL DEFAULT 'en_cours',
      statut_tresorerie TEXT NOT NULL DEFAULT 'en_cours',
      statut_stock TEXT NOT NULL DEFAULT 'en_cours',
      total_recettes REAL NOT NULL DEFAULT 0,
      total_depenses REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS depenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      marree_id INTEGER REFERENCES marrees(id),
      date_execution TEXT,
      compte_frais TEXT,
      part_aya REAL DEFAULT 0,
      part_capitaine REAL DEFAULT 0,
      type_paiement TEXT,
      fournisseur_id INTEGER REFERENCES fournisseurs(id),
      facture TEXT,
      objet_depense TEXT,
      type_detail TEXT,
      qte REAL DEFAULT 0,
      pu REAL DEFAULT 0,
      montant_total REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS journal_peche (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      marree_id INTEGER REFERENCES marrees(id),
      date_etab TEXT,
      date_jp TEXT,
      statut TEXT DEFAULT 'brouillon'
    );
    CREATE TABLE IF NOT EXISTS captures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      journal_id INTEGER REFERENCES journal_peche(id),
      espece TEXT NOT NULL,
      qte REAL DEFAULT 0,
      pu_capitaine REAL DEFAULT 0,
      pu_smcp REAL DEFAULT 0,
      pt_capitaine REAL DEFAULT 0,
      pt_smcp REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS recettes_ventes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      marree_id INTEGER REFERENCES marrees(id),
      date_encaissement TEXT,
      espece TEXT,
      poids_vendu REAL DEFAULT 0,
      montant_total REAL DEFAULT 0,
      libelle TEXT
    );
    CREATE TABLE IF NOT EXISTS caisses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      caissier TEXT
    );
    CREATE TABLE IF NOT EXISTS sessions_caisse (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caisse_id INTEGER REFERENCES caisses(id),
      date_debut TEXT,
      date_fin TEXT,
      solde REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS transactions_caisse (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER REFERENCES sessions_caisse(id),
      type TEXT NOT NULL,
      montant REAL NOT NULL,
      date TEXT,
      libelle TEXT,
      marree_id INTEGER REFERENCES marrees(id),
      fournisseur_id INTEGER REFERENCES fournisseurs(id)
    );
    CREATE TABLE IF NOT EXISTS comptes_bancaires (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT NOT NULL UNIQUE,
      libelle TEXT
    );
    CREATE TABLE IF NOT EXISTS seed_done (
      id INTEGER PRIMARY KEY,
      done INTEGER DEFAULT 0
    );
  `);
}

function seedData(database: any) {
  const result = database.exec("SELECT done FROM seed_done WHERE id = 1");
  if (result.length > 0 && result[0].values[0][0] === 1) return;

  database.run(`INSERT OR IGNORE INTO seed_done (id, done) VALUES (1, 1)`);

  database.run(`
    INSERT INTO capitaines (nom) VALUES ('Hassan Benali'),('Youssef Chraibi'),('Mohammed Tazi'),('Rachid Alami');
    INSERT INTO fournisseurs (nom) VALUES ('Total Maroc'),('Marjane Pro'),('SMCP Agadir'),('Ice Supply SA'),('Sardine Express');
    INSERT INTO bateaux (nom, capitaine_courant, statut, locataire) VALUES
      ('AYA 1', 1, 'actif', NULL),('AYA 2', 2, 'actif', NULL),('AYA 3', 3, 'maintenance', NULL),('AYA 4', 4, 'actif', 'Soc. Pêche Atlas');
    INSERT INTO marrees (code, bateau_id, capitaine_id, date_depart, date_retour, statut_logistique, statut_tresorerie, statut_stock, total_recettes, total_depenses) VALUES
      ('MAR-2026-001', 1, 1, '2026-04-01', '2026-04-15', 'achevee', 'achevee', 'achevee', 185000, 62000),
      ('MAR-2026-002', 2, 2, '2026-04-10', '2026-04-28', 'achevee', 'en_cours', 'achevee', 210000, 74500),
      ('MAR-2026-003', 1, 1, '2026-05-01', NULL, 'en_cours', 'en_cours', 'en_cours', 0, 18000),
      ('MAR-2026-004', 4, 4, '2026-04-20', '2026-05-03', 'achevee', 'achevee', 'en_cours', 95000, 31000);
    INSERT INTO depenses (marree_id, date_execution, compte_frais, part_aya, part_capitaine, type_paiement, fournisseur_id, objet_depense, type_detail, qte, pu, montant_total) VALUES
      (1, '2026-04-01', 'Carburant', 25000, 0, 'virement', 1, 'Gasoil départ', 'Carburant', 5000, 5, 25000),
      (1, '2026-04-01', 'Glace', 8000, 0, 'espèces', 4, 'Glace départ', 'Glace', 400, 20, 8000),
      (1, '2026-04-01', 'Sardine', 12000, 0, 'espèces', 5, 'Appâts sardine', 'Sardine', 600, 20, 12000),
      (1, '2026-04-02', 'Nourriture', 4500, 0, 'espèces', 2, 'Vivres équipage', 'Nourriture', 1, 4500, 4500),
      (2, '2026-04-10', 'Carburant', 28000, 0, 'virement', 1, 'Gasoil départ', 'Carburant', 5600, 5, 28000),
      (2, '2026-04-10', 'Glace', 9500, 0, 'espèces', 4, 'Glace départ', 'Glace', 475, 20, 9500),
      (3, '2026-05-01', 'Carburant', 15000, 0, 'virement', 1, 'Gasoil départ', 'Carburant', 3000, 5, 15000),
      (3, '2026-05-01', 'Glace', 3000, 0, 'espèces', 4, 'Glace départ', 'Glace', 150, 20, 3000);
    INSERT INTO journal_peche (marree_id, date_etab, date_jp, statut) VALUES
      (1, '2026-04-16', '2026-04-16', 'validé'),(2, '2026-04-29', '2026-04-29', 'validé');
    INSERT INTO captures (journal_id, espece, qte, pu_capitaine, pu_smcp, pt_capitaine, pt_smcp) VALUES
      (1, 'Poulpe', 8500, 18, 22, 153000, 187000),(1, 'PG', 1200, 12, 15, 14400, 18000),(1, 'PF', 400, 8, 10, 3200, 4000),
      (2, 'Poulpe', 10200, 18, 22, 183600, 224400),(2, 'PG', 1800, 12, 15, 21600, 27000),(2, 'PR', 300, 10, 12, 3000, 3600);
    INSERT INTO recettes_ventes (marree_id, date_encaissement, espece, poids_vendu, montant_total, libelle) VALUES
      (1, '2026-04-18', 'Poulpe', 8500, 187000, 'Vente SMCP - Lot 001'),
      (1, '2026-04-18', 'PG', 1200, 18000, 'Vente SMCP - Lot 001'),
      (2, '2026-04-30', 'Poulpe', 10200, 224400, 'Vente SMCP - Lot 002'),
      (4, '2026-05-05', 'Poulpe', 4200, 92400, 'Vente SMCP - Lot 003');
    INSERT INTO caisses (code, caissier) VALUES ('CAISSE-001', 'Fatima Zahra'),('CAISSE-002', 'Omar Naciri');
    INSERT INTO sessions_caisse (caisse_id, date_debut, date_fin, solde) VALUES (1, '2026-04-01', '2026-04-30', 125000),(1, '2026-05-01', NULL, 87500);
    INSERT INTO transactions_caisse (session_id, type, montant, date, libelle, marree_id) VALUES
      (1, 'entree', 187000, '2026-04-18', 'Encaissement vente MAR-001', 1),
      (1, 'sortie', 25000, '2026-04-01', 'Carburant MAR-001', 1),
      (1, 'sortie', 8000, '2026-04-01', 'Glace MAR-001', 1),
      (1, 'entree', 224400, '2026-04-30', 'Encaissement vente MAR-002', 2),
      (1, 'sortie', 28000, '2026-04-10', 'Carburant MAR-002', 2),
      (2, 'entree', 92400, '2026-05-05', 'Encaissement vente MAR-004', 4),
      (2, 'sortie', 15000, '2026-05-01', 'Carburant MAR-003', 3);
    INSERT INTO comptes_bancaires (numero, libelle) VALUES ('MA123456789', 'CIH - Compte Principal'),('MA987654321', 'Attijariwafa - Opérationnel');
  `);
}

export default getDb;

// Helper to run queries and get results as array of objects
function queryAll(database: any, sql: string, params: any[] = []): any[] {
  const stmt = database.prepare(sql);
  if (params.length) stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(database: any, sql: string, params: any[] = []): any {
  const results = queryAll(database, sql, params);
  return results.length > 0 ? results[0] : null;
}

export async function getAllMarrees() {
  const db = await getDb();
  return queryAll(db, `
    SELECT m.*, b.nom as bateau_nom, c.nom as capitaine_nom
    FROM marrees m
    LEFT JOIN bateaux b ON m.bateau_id = b.id
    LEFT JOIN capitaines c ON m.capitaine_id = c.id
    ORDER BY m.id DESC
  `);
}

export async function getMarreeById(id: number) {
  const db = await getDb();
  return queryOne(db, `
    SELECT m.*, b.nom as bateau_nom, c.nom as capitaine_nom
    FROM marrees m
    LEFT JOIN bateaux b ON m.bateau_id = b.id
    LEFT JOIN capitaines c ON m.capitaine_id = c.id
    WHERE m.id = ?
  `, [id]);
}

export async function getDepensesByMarree(marreeId: number) {
  const db = await getDb();
  return queryAll(db, `
    SELECT d.*, f.nom as fournisseur_nom
    FROM depenses d
    LEFT JOIN fournisseurs f ON d.fournisseur_id = f.id
    WHERE d.marree_id = ?
    ORDER BY d.date_execution ASC
  `, [marreeId]);
}

export async function getJournalByMarree(marreeId: number) {
  const db = await getDb();
  return queryAll(db, `SELECT * FROM journal_peche WHERE marree_id = ?`, [marreeId]);
}

export async function getCapturesByJournal(journalId: number) {
  const db = await getDb();
  return queryAll(db, `SELECT * FROM captures WHERE journal_id = ?`, [journalId]);
}

export async function getRecettesByMarree(marreeId: number) {
  const db = await getDb();
  return queryAll(db, `SELECT * FROM recettes_ventes WHERE marree_id = ? ORDER BY date_encaissement ASC`, [marreeId]);
}

export async function getAllBateaux() {
  const db = await getDb();
  return queryAll(db, `
    SELECT b.*, c.nom as capitaine_nom
    FROM bateaux b
    LEFT JOIN capitaines c ON b.capitaine_courant = c.id
    ORDER BY b.id ASC
  `);
}

export async function getAllCapitaines() {
  const db = await getDb();
  return queryAll(db, `SELECT * FROM capitaines ORDER BY nom ASC`);
}

export async function getAllFournisseurs() {
  const db = await getDb();
  return queryAll(db, `SELECT * FROM fournisseurs ORDER BY nom ASC`);
}

export async function getAllCaisses() {
  const db = await getDb();
  return queryAll(db, `
    SELECT c.*, s.solde as solde_actuel
    FROM caisses c
    LEFT JOIN sessions_caisse s ON s.caisse_id = c.id AND s.date_fin IS NULL
    ORDER BY c.id ASC
  `);
}

export async function getSessionsByCaisse(caisseId: number) {
  const db = await getDb();
  return queryAll(db, `SELECT * FROM sessions_caisse WHERE caisse_id = ? ORDER BY date_debut DESC`, [caisseId]);
}

export async function getTransactionsBySession(sessionId: number) {
  const db = await getDb();
  return queryAll(db, `
    SELECT t.*, m.code as marree_code, f.nom as fournisseur_nom
    FROM transactions_caisse t
    LEFT JOIN marrees m ON t.marree_id = m.id
    LEFT JOIN fournisseurs f ON t.fournisseur_id = f.id
    WHERE t.session_id = ?
    ORDER BY t.date DESC
  `, [sessionId]);
}

export async function getDashboardKpis() {
  const db = await getDb();
  const totalMarrees = queryOne(db, `SELECT COUNT(*) as count FROM marrees`)?.count || 0;
  const activeMarrees = queryOne(db, `SELECT COUNT(*) as count FROM marrees WHERE statut_logistique = 'en_cours'`)?.count || 0;
  const totalRecettes = queryOne(db, `SELECT COALESCE(SUM(montant_total),0) as total FROM recettes_ventes`)?.total || 0;
  const totalDepenses = queryOne(db, `SELECT COALESCE(SUM(montant_total),0) as total FROM depenses`)?.total || 0;
  const soldeCaisse = queryOne(db, `SELECT COALESCE(SUM(CASE WHEN type='entree' THEN montant ELSE -montant END),0) as solde FROM transactions_caisse`)?.solde || 0;
  return { totalMarrees, activeMarrees, totalRecettes, totalDepenses, soldeCaisse };
}

export async function getRecentMarrees(limit = 5) {
  const db = await getDb();
  return queryAll(db, `
    SELECT m.*, b.nom as bateau_nom, c.nom as capitaine_nom
    FROM marrees m
    LEFT JOIN bateaux b ON m.bateau_id = b.id
    LEFT JOIN capitaines c ON m.capitaine_id = c.id
    ORDER BY m.id DESC
    LIMIT ?
  `, [limit]);
}

export async function runQuery(sql: string, params: any[] = []) {
  const db = await getDb();
  db.run(sql, params);
  saveDb(db);
}
