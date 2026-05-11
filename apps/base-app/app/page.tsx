import { Header } from "@repo/ui/header";
import { getDivisions } from "@/lib/queries";
import LandingPage from "@/components/LandingPage";

export default async function Home() {
  const divisions = await getDivisions();

  return (
    <main className="min-h-screen bg-brand-cream selection:bg-brand-gold selection:text-white pb-20">
      <Header divisions={divisions} />
      <LandingPage divisions={divisions} />
    </main>
  );
}
