import { Header } from "@repo/ui/header";
import { getDivisions } from "@/lib/queries";
import ContactPage from "@/components/ContactPage";

export default async function Contact() {
  const divisions = await getDivisions();

  return (
    <main className="h-screen bg-brand-cream selection:bg-brand-gold selection:text-white flex flex-col overflow-hidden">
      <Header divisions={divisions} />
      <ContactPage />
    </main>
  );
}
