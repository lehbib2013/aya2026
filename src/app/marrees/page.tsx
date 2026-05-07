import { getAllMarrees, getAllBateaux, getAllCapitaines } from "@/lib/db";
import Link from "next/link";
import MarreesClient from "./MarreesClient";

export default async function MarreesPage() {
  const marrees     = await getAllMarrees()    as any[];
  const bateaux     = await getAllBateaux()    as any[];
  const capitaines  = await getAllCapitaines() as any[];

  return (
    <MarreesClient
      marrees={marrees}
      bateaux={bateaux}
      capitaines={capitaines}
    />
  );
}
