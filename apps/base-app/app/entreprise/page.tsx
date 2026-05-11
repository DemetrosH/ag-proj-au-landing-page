import { Header } from "@repo/ui/header";
import { getDivisions } from "@/lib/queries";
import EntrepriseContent from "@/components/EntrepriseContent";

export default async function EntreprisePage() {
  const divisions = await getDivisions();

  return (
    <main className="min-h-screen bg-brand-cream selection:bg-brand-gold selection:text-white">
      <Header divisions={divisions} />
      <EntrepriseContent divisions={divisions} />
    </main>
  );
}
