import { Header } from "@repo/ui/header";
import { getTeamMembers, getDivisions } from "@/lib/queries";
import EquipePage from "@/components/EquipePage";

export default async function Equipe() {
  const [members, divisions] = await Promise.all([
    getTeamMembers(),
    getDivisions()
  ]);

  return (
    <main className="min-h-screen bg-brand-cream pb-20 overflow-x-hidden">
      <Header divisions={divisions} />
      <div className="pt-20">
        <EquipePage members={members} />
      </div>
    </main>
  );
}
