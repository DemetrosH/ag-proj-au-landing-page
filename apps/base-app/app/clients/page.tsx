import { Header } from "@repo/ui/header";
import { getDivisions } from "@/lib/queries";

export default async function Clients() {
  const divisions = await getDivisions();

  return (
    <main className="min-h-screen bg-brand-cream pb-20">
      <Header divisions={divisions} />
      <div className="pt-32 max-w-4xl mx-auto px-4">
        <h1 className="font-display text-5xl font-bold text-brand-charcoal mb-6">Nos Clients & Partenaires</h1>
        <div className="brand-line w-24 mb-10" />
        <p className="text-lg text-gray-700 leading-relaxed">
          Ils nous font confiance pour la mise en valeur de leur patrimoine et la production de leurs événements majeurs.
        </p>
      </div>
    </main>
  );
}
