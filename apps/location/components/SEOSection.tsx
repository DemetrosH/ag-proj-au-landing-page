import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function SEOSection() {
  return (
    <section className="py-32 bg-white border-t border-gray-100 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-10 text-gray-950 leading-tight uppercase tracking-tight">
              Expertise en <span className="text-brand-gold">Location d'équipement événementiel</span>
            </h2>
            <div className="prose prose-lg text-gray-500 font-medium leading-relaxed">
              <p className="mb-6">
                Vous planifiez un projet culturel ou un rassemblement corporatif au Québec ? Artéfact urbain est votre partenaire de confiance pour la location d'équipement événementiel. Notre mission est de simplifier l'organisation technique de vos projets en offrant un inventaire varié et de haute qualité, spécifiquement adapté aux besoins du milieu de la culture et du patrimoine.
              </p>
              <p>
                Que vous ayez besoin de mobilier stylisé, d'une sonorisation performante ou de solutions vidéo de pointe, notre équipe s'assure que chaque composante technique contribue à la réussite immersive de votre événement.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="flex flex-col gap-6">
              {[
                { title: "Solutions d'éclairage d'ambiance", desc: "Création d'atmosphères visuelles sur mesure." },
                { title: "Mobilier et structures de scène", desc: "Équipements de haute qualité pour chaque configuration." },
                { title: "Soutien technique multidisciplinaire", desc: "Une équipe d'experts dédiée à la réussite de votre projet." },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-brand-gold/30 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="text-brand-gold" size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-950 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-8 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40">
              <p className="text-gray-950 italic font-medium leading-relaxed">
                "Artéfact Urbain est spécialisé dans la mise en valeur du patrimoine, l'archéologie et la fabrication technique. Notre division de location événementielle bénéficie de cette même rigueur multidisciplinaire."
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-bold text-xs uppercase">
                  AU
                </div>
                <div>
                  <div className="font-bold text-gray-950 text-sm">ArtéfactUrbain</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Expertise Multidisciplinaire</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
