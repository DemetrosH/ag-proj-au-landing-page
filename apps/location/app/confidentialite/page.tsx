import React from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-5xl font-black text-brand-dark uppercase tracking-tighter mb-12">
            Politique de <span className="text-brand-orange">Confidentialité</span>
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-8">
            <p className="font-bold text-gray-900">Dernière date de modification : le 5 octobre 2023</p>
            
            <section>
              <p>
                En vertu de la Loi sur la protection des renseignements personnels dans le secteur privé, communément nommée la Loi 25, Artéfact urbain s’engage à se conformer aux normes éthiques qui se doivent lors du traitement des renseignements personnels. Cette Politique de confidentialité a pour objectif de vous informer de nos pratiques en matière de gestion des données et renseignements personnels et se veut un engagement formel de l’entreprise à l’égard de la protection des renseignements personnels auxquels elle a accès.
              </p>
              <p>
                Devant le développement des nouveaux outils de communication, il est nécessaire de porter une attention particulière à la protection de la vie privée. C’est pourquoi nous nous engageons à respecter la confidentialité des renseignements personnels que nous collectons.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Qu’est-ce qu’un renseignement personnel?</h2>
              <p>
                Selon la Commission d’accès à l’information du Québec, un renseignement personnel « permet d’identifier une personne physique, directement ou indirectement ».
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Collecte des renseignements personnels</h2>
              <p>
                Les renseignements personnels que nous collectons sont recueillis au travers de formulaires et grâce à l’interactivité établie entre vous et notre site Internet. Nous utilisons également des fichiers témoins et/ou journaux pour réunir des informations vous concernant :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prénom et nom;</li>
                <li>Adresse postale;</li>
                <li>Code postal;</li>
                <li>Adresse électronique;</li>
                <li>Numéro de téléphone/télécopieur.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Utilisation des renseignements personnels</h2>
              <p>
                Nous utilisons les renseignements personnels ainsi collectés pour les finalités suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Offrir des services de location;</li>
                <li>Suivi de commande et soumission;</li>
                <li>Informations et offres promotionnelles;</li>
                <li>Statistiques et amélioration du service;</li>
                <li>Contact et support client.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Sécurité</h2>
              <p>
                Les renseignements personnels que nous collectons sont conservés dans un environnement sécurisé. Pour assurer la sécurité de vos renseignements personnels, nous avons recours aux mesures suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Protocole SSL (Secure Sockets Layer);</li>
                <li>Gestion des accès – personnes autorisées uniquement;</li>
                <li>Sauvegarde informatique et pare-feu;</li>
                <li>Identifiant et mot de passe sécurisés.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Responsable de la protection des renseignements personnels</h2>
              <p>
                Pour toute question ou pour exercer vos droits d’accès, de rectification ou de retrait, veuillez contacter :
              </p>
              <p className="font-bold text-brand-dark">
                Emile Couture<br />
                <a href="mailto:renseignements@artefacturbain.ca" className="text-brand-orange hover:underline">renseignements@artefacturbain.ca</a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
