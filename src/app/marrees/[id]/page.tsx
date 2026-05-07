import { getMarreeById, getDepensesByMarree, getJournalByMarree, getCapturesByJournal, getRecettesByMarree, getAllFournisseurs } from "@/lib/db";
import { notFound } from "next/navigation";
import MarreeDetailClient from "./MarreeDetailClient";

interface Props {
  params: { id: string };
}

export default async function MarreeDetailPage({ params }: Props) {
  const id = Number(params.id);
  const marree = await getMarreeById(id) as any;
  if (!marree) notFound();

  const depenses   = await getDepensesByMarree(id)   as any[];
  const journals   = await getJournalByMarree(id)    as any[];
  const recettes   = await getRecettesByMarree(id)   as any[];
  const fournisseurs = await getAllFournisseurs()     as any[];

  // gather captures for each journal
  const capturesMap: Record<number, any[]> = {};
  for (const j of journals) {
    capturesMap[j.id] = await getCapturesByJournal(j.id) as any[];
  }

  return (
    <MarreeDetailClient
      marree={marree}
      depenses={depenses}
      journals={journals}
      capturesMap={capturesMap}
      recettes={recettes}
      fournisseurs={fournisseurs}
    />
  );
}
