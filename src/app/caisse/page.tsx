import { getAllCaisses, getSessionsByCaisse, getTransactionsBySession } from "@/lib/db";
import CaisseClient from "./CaisseClient";

export default async function CaissePage() {
  const caisses = await getAllCaisses() as any[];

  // Fetch sessions and transactions for each caisse
  const sessionsMap: Record<number, any[]> = {};
  const transactionsMap: Record<number, any[]> = {};

  for (const c of caisses) {
    const sessions = await getSessionsByCaisse(c.id) as any[];
    sessionsMap[c.id] = sessions;
    for (const s of sessions) {
      transactionsMap[s.id] = await getTransactionsBySession(s.id) as any[];
    }
  }

  return (
    <CaisseClient
      caisses={caisses}
      sessionsMap={sessionsMap}
      transactionsMap={transactionsMap}
    />
  );
}
