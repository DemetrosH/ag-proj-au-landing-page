'use client';

import React from 'react';
import Link from 'next/link';

export function NeonBanner() {
  return (
    <div className="mt-16 bg-[#1A1A1A] rounded-[2rem] p-12 text-center text-white relative overflow-hidden border border-gray-800 shadow-2xl">
      {/* Subtle glow effect top border */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-orange/50 to-transparent"></div>
      
      <div className="relative z-10">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-6 leading-tight">
          NOS NÉONS SONT FABRIQUÉS <br className="hidden md:block" />
          <span className="text-brand-orange shadow-orange-500/50 drop-shadow-[0_0_12px_rgba(247,168,49,0.9)]">SUR MESURE</span>
        </h2>
        
        <p className="text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium text-lg">
          Découvrez notre inventaire de <span className="text-white font-bold">location d'enseignes néon</span> pour illuminer vos événements ou profitez de notre service de fabrication sur mesure.
        </p>
        
        <Link 
          href="/contact"
          className="inline-block px-10 py-5 rounded-full border-2 border-brand-orange text-white font-bold uppercase tracking-[0.2em] text-xs hover:bg-brand-orange hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(247,168,49,0.2)] hover:shadow-[0_0_40px_rgba(247,168,49,0.6)] group"
        >
          DEMANDER VOTRE SOUMISSION PERSONNALISÉE
        </Link>
        
        <div className="mt-12 pt-8 border-t border-gray-800/50 text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
          Ou contactez-nous directement : <a href="mailto:location@artefacturbain.ca" className="text-brand-orange hover:text-brand-gold transition-colors">location@artefacturbain.ca</a>
        </div>
      </div>

      {/* Decorative background glow */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-orange/5 rounded-full blur-[100px]"></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-orange/5 rounded-full blur-[100px]"></div>
    </div>
  );
}
