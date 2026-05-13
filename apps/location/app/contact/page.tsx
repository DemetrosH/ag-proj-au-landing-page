import type { Metadata } from 'next';
import { Header } from '../../components/Header';
import { ContactForm } from '../../components/ContactForm';
import { Footer } from '../../components/Footer';
import { getUserRole, getUserProfile } from '../../lib/auth';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact | Artéfact Urbain Location',
  description: 'Entrez en contact avec Artéfact Urbain pour vos besoins de location d\'équipement.',
}

export default async function ContactPage() {
  const profile = await getUserProfile();
  const role = profile?.role || 'guest';
  const isConnected = !!profile;
  const isGuest = !isConnected; // Now isGuest means "not logged in"

  return (
    <div className="min-h-screen bg-white flex flex-col font-poppins overflow-hidden">
      <Header />
      <main className="flex-grow flex flex-col">
        {/* 1. Hero Section - More Compact */}
        <section className="relative pt-16 pb-12 overflow-hidden bg-white border-b border-gray-50">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-gray/30 -skew-x-6 translate-x-1/4 z-0" />
          
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="max-w-4xl">
               <h1 className="text-5xl md:text-6xl font-black text-brand-dark uppercase tracking-tighter leading-tight mb-4 animate-fade-in-up">
                Parlons <span className="text-brand-orange">Projet</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 mb-0 leading-relaxed font-medium max-w-xl">
                Une question technique ou une demande de devis ? Notre équipe est là pour vous accompagner.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Contact Cards & Form Section */}
        <section className="py-20 bg-white flex-grow">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              
              {/* Left Side: Info Cards */}
              <div className="lg:col-span-4 space-y-8">
                {/* Adresse Card */}
                <div id="address" className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange to-brand-gold rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-500" />
                  <div className="relative bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 10H9V12H7V10M7 14H9V16H7V14M7 6H9V8H7V6M11 6H13V8H11V6M11 10H13V12H11V10M11 14H13V16H11V14M15 6H17V8H15V6M15 10H17V12H15V10M15 14H17V16H15V14M19 2H5C3.89 2 3 2.89 3 4V20C3 21.11 3.89 22 5 22H19C20.11 22 21 21.11 21 20V4C21 2.89 20.11 2 19 2M19 20H5V4H19V20Z"/>
                        </svg>
                      </div>
                      <h2 className="text-xl font-black text-brand-dark uppercase tracking-tighter">Notre Bureau</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-brand-orange font-black uppercase tracking-widest text-[9px] mb-1">Siège Social</p>
                        <h3 className="font-black text-lg text-brand-dark uppercase tracking-tight mb-1 text-balance">Saint-Marc-des-Carrières</h3>
                        <div className="text-sm text-gray-500 font-medium leading-relaxed">
                          <p>277 Boul. Bona-Dussault,</p>
                          <p>G0A 4B0, QC</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <a 
                        href="https://maps.google.com/?q=277+Boul.+Bona-Dussault,+Saint-Marc-des-Carrières,+QC+G0A+4B0" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-3 text-brand-dark hover:text-brand-orange font-black uppercase tracking-widest text-[10px] transition-colors group/link"
                      >
                        <span className="w-8 h-8 rounded-full border-2 border-brand-dark group-hover/link:border-brand-orange flex items-center justify-center transition-colors">
                          <span className="group-hover/link:translate-x-1 transition-transform duration-300">→</span>
                        </span>
                        <span>Itinéraire</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Quick Help Card */}
                <div className="bg-brand-dark p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                  <div className="relative z-10">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Besoin d'aide ?</h3>
                    <p className="text-gray-400 text-xs font-medium mb-4">Notre équipe technique est disponible du lundi au vendredi.</p>
                    <p className="text-brand-orange font-black text-lg">location@artefacturbain.ca</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Contact Form */}
              <div className="lg:col-span-8">
                <div className="bg-brand-surface rounded-[3rem] p-8 md:p-16 border border-brand-border shadow-2xl shadow-brand-dark/5 relative overflow-hidden">
                  {isGuest && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center p-8">
                      <div className="bg-white border border-brand-border rounded-[3rem] p-12 shadow-2xl text-center max-w-sm">
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Accès <span className="text-brand-orange">Réservé</span></h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8 leading-relaxed">
                          Veuillez vous connecter à votre compte pour accéder au formulaire de contact.
                        </p>
                        <Link 
                          href="/login" 
                          className="bg-brand-dark text-white font-black uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-brand-orange transition-all shadow-xl block"
                        >
                          Se Connecter
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="mb-10">
                    <h2 className="text-4xl font-black text-brand-dark uppercase tracking-tighter mb-2">
                      Prêt à <span className="text-brand-orange">Collaborer?</span>
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
                      Décrivez votre besoin. Nous vous répondrons dans les 24 heures.
                    </p>
                  </div>

                  <ContactForm isGuest={isGuest} />
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
