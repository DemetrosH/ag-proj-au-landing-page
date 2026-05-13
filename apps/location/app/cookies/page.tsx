import React from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-5xl font-black text-brand-dark uppercase tracking-tighter mb-12">
            Politique relative aux <span className="text-brand-orange">Témoins</span>
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-8">
            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Qu'est-ce qu'un témoin (cookie) ?</h2>
              <p>
                Un témoin est un petit fichier texte déposé sur votre ordinateur ou appareil mobile lors de la visite d'un site web. Il permet au site de mémoriser vos actions et préférences sur une période donnée pour faciliter votre navigation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Utilisation des témoins sur ce site</h2>
              <p>
                Artéfact Urbain utilise des témoins pour assurer le bon fonctionnement de la plateforme de location et améliorer votre expérience :
              </p>
              <ul className="list-disc pl-6 space-y-4">
                <li>
                  <strong className="text-brand-dark">Témoins essentiels :</strong> Nécessaires pour la gestion de votre panier, l'authentification à votre compte partenaire et la sécurité du site.
                </li>
                <li>
                  <strong className="text-brand-dark">Témoins de performance :</strong> Nous permettent d'analyser l'utilisation du site via des outils comme Google Analytics pour optimiser l'inventaire et la navigation.
                </li>
                <li>
                  <strong className="text-brand-dark">Témoins de personnalisation :</strong> Utilisés pour mémoriser vos préférences d'affichage ou vos recherches récentes.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Gestion de vos préférences</h2>
              <p>
                Vous pouvez à tout moment configurer votre navigateur pour bloquer les témoins ou vous avertir de leur présence. Notez toutefois que certaines fonctionnalités du site (comme le panier de soumission) pourraient ne pas fonctionner correctement sans les témoins essentiels.
              </p>
              <p>
                Pour modifier vos préférences directement sur notre site, vous pouvez utiliser le gestionnaire de consentement accessible via l'icône de paramètres en bas de page (si disponible).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Contact</h2>
              <p>
                Pour toute question relative à notre utilisation des témoins, contactez-nous à <a href="mailto:renseignements@artefacturbain.ca" className="text-brand-orange hover:underline">renseignements@artefacturbain.ca</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
