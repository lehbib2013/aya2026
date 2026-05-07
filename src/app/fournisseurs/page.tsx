import { getAllFournisseurs } from "@/lib/db";
import FournisseursClient from "./FournisseursClient";

export default async function FournisseursPage() {
  const fournisseurs = await getAllFournisseurs() as any[];
  return <FournisseursClient fournisseurs={fournisseurs} />;
}
