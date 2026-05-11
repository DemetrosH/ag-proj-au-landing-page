'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const features = [
  "Scène & structure",
  "Ameublement & décor",
  "Sonorisation & éclairage",
  "Vidéo & technologie",
  "Enseigne Néon sur mesure"
];

export function InspiredHero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-white">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-gray/50 -skew-x-6 translate-x-1/4 z-0" />
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Column: Content */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-brand-dark uppercase tracking-tight md:tracking-tighter leading-[1.1] md:leading-[0.9] mb-8">
                Votre Expertise, <br />
                Notre <span className="text-brand-orange">Équipement</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed font-medium">
                Artéfact Urbain est votre partenaire technique pour tous vos besoins en location d'équipement événementiel. Nous assurons la réussite visuelle et logistique de vos projets.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center space-x-3 group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-orange/10 flex items-center justify-center group-hover:bg-brand-orange transition-colors">
                      <svg className="w-4 h-4 text-brand-orange group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-bold text-brand-dark uppercase text-sm tracking-wide">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <a href="#inventory" className="btn-orange text-sm uppercase tracking-widest text-center w-full sm:w-auto">
                  Parcourir l'inventaire
                </a>
                <a href="/contact" className="btn-outline text-sm uppercase tracking-widest text-center w-full sm:w-auto">
                  Demander un devis
                </a>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column: Visual Card */}
          <div className="lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative aspect-square md:aspect-video lg:aspect-[4/5] w-full max-w-lg mx-auto"
            >
              {/* Main Gradient Card */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan to-brand-cyan-light rounded-[3rem] shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                
                {/* Floating Image Elements (Mockups) */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 w-4/5 h-1/2 z-20"
                >
                   {/* Placeholder for a featured equipment image */}
                   <div className="w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 flex items-center justify-center">
                     <div className="text-white font-black text-4xl opacity-50 uppercase tracking-widest rotate-12">
                        Location
                     </div>
                   </div>
                </motion.div>
                
                <div className="absolute bottom-12 left-12 right-12 z-30">
                   <div className="glass-card p-8 rounded-3xl">
                      <p className="text-brand-dark font-black uppercase tracking-widest text-xs mb-2">Service Clé en Main</p>
                      <p className="text-gray-600 text-sm font-medium">Installation, transport et support technique pour tous vos événements.</p>
                   </div>
                </div>
              </div>
              
              {/* Decorative side element - Hidden on mobile */}
              <div className="hidden lg:block absolute -bottom-6 -left-6 w-24 h-24 bg-brand-orange rounded-3xl z-0" />
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
