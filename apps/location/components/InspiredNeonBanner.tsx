'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function InspiredNeonBanner() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative w-full bg-brand-dark rounded-[2rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-20 border border-white/10 group"
        >
          {/* Background Glows */}
          <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-pink-600/20 blur-[100px] md:blur-[120px] rounded-full"></div>

          {/* Neon Text */}
          <div className="relative z-10 flex-shrink-0 mb-10 md:mb-0 text-center md:text-left">
            <h2 
              className="text-white font-black uppercase tracking-[0.2em] text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-none"
              style={{
                textShadow: '0 0 10px rgba(236, 72, 153, 0.8), 0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)'
              }}
            >
              Enseigne<br/>Néon
            </h2>
            <div className="mt-4 flex justify-center md:justify-start space-x-2">
               {[1,2,3].map(i => <div key={i} className="h-1 w-8 md:w-12 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,1)]" />)}
            </div>
          </div>

          {/* Bottom Content */}
          <div className="relative z-10 flex flex-col items-center md:items-end text-center md:text-right space-y-8">
            <p className="text-gray-400 font-medium leading-relaxed max-w-md text-lg">
              Illuminez vos événements avec nos créations sur mesure. Ajoutez une touche de lumière unique à votre décor.
            </p>
            <Link 
              href="/categories/enseigne-neon"
              className="inline-block px-10 py-5 text-sm font-black text-white tracking-[0.3em] uppercase border-2 border-pink-500 hover:bg-pink-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all duration-300 rounded-full"
            >
              Voir l'inventaire
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
