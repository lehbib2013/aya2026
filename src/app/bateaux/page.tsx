import { getAllBateaux, getAllCapitaines } from "@/lib/db";
import BateauxClient from "./BateauxClient";

export default async function BateauxPage() {
  const bateaux    = await getAllBateaux()    as any[];
  const capitaines = await getAllCapitaines() as any[];
  return <BateauxClient bateaux={bateaux} capitaines={capitaines} />;
}
