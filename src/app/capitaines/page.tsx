import { getAllCapitaines } from "@/lib/db";
import CapitainesClient from "./CapitainesClient";

export default async function CapitainesPage() {
  const capitaines = await getAllCapitaines() as any[];
  return <CapitainesClient capitaines={capitaines} />;
}
