import React from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export default function ConditionsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-5xl font-black text-brand-dark uppercase tracking-tighter mb-12">
            Conditions <span className="text-brand-orange">Générales</span>
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-8">
            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">1. Acceptation des conditions</h2>
              <p>
                En accédant au site de location d'Artéfact Urbain, vous acceptez d'être lié par les présentes conditions d'utilisation, toutes les lois et réglementations applicables, et acceptez que vous êtes responsable du respect des lois locales applicables.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">2. Conditions de location</h2>
              <p>
                Toute demande de soumission via ce site ne constitue pas une réservation finale. Une réservation est considérée comme confirmée uniquement après validation par notre équipe technique et réception d'un contrat signé ou d'un acompte, selon les modalités discutées.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Les prix affichés sont à titre indicatif et peuvent varier selon la durée et la complexité du projet.</li>
                <li>Le locataire est responsable de l'équipement dès la prise de possession jusqu'au retour.</li>
                <li>Tout dommage ou perte fera l'objet d'une facturation supplémentaire.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">3. Utilisation du site</h2>
              <p>
                Le contenu de ce site est protégé par les lois sur le droit d'auteur et les marques de commerce. Il est interdit de copier, modifier ou distribuer le contenu sans autorisation préalable écrite d'Artéfact Urbain.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">4. Limitation de responsabilité</h2>
              <p>
                Artéfact Urbain ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le matériel loué ou les informations présentes sur ce site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">5. Modifications</h2>
              <p>
                Artéfact Urbain peut réviser ces conditions d'utilisation pour son site Web à tout moment sans préavis. En utilisant ce site Web, vous acceptez d'être lié par la version alors en vigueur de ces conditions.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
