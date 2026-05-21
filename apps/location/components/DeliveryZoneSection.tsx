'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Truck, ShieldCheck } from 'lucide-react';

export function DeliveryZoneSection({ height = "50vh" }: { height?: string }) {
  return (
    <section 
      style={{ height }}
      className="relative min-h-[400px] bg-brand-dark overflow-hidden border-y border-white/5"
    >
      {/* Interactive Google Map with Dark Filter */}
      <div className="absolute inset-0 z-0">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src="https://maps.google.com/maps?q=277%20Boul.%20Bona-Dussault,%20Saint-Marc-des-Carrières,%20QC%20G0A%204B0&t=&z=10&ie=UTF8&iwloc=&output=embed"
          style={{ 
            filter: 'grayscale(1) invert(0.92) contrast(1.2) brightness(0.8)',
            pointerEvents: 'auto',
            border: 0,
            opacity: 0.6
          }}
          className="w-full h-full grayscale brightness-50"
        ></iframe>
        
        {/* Custom Visual Pin at Center */}
        <div className="absolute inset-0 hidden lg:flex items-center justify-center pointer-events-none z-20">
          <motion.div 
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* Subtle Glow */}
            <div className="absolute -inset-4 bg-brand-orange/5 rounded-full blur-xl" />
            
            {/* The Pin Icon - Smaller */}
            <div className="relative bg-brand-dark border border-brand-orange/50 p-2 rounded-full shadow-[0_0_15px_rgba(242,101,34,0.3)] flex items-center justify-center text-brand-orange translate-y-[-50%]">
              <MapPin size={16} fill="currentColor" className="text-brand-orange" />
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-brand-orange/50" />
            </div>

            {/* HQ Label - Even more subtle */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-brand-dark/40 backdrop-blur-sm border border-white/5 px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">SIÈGE</p>
            </div>
          </motion.div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/40 to-transparent pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl h-full relative z-10">
        <div className="flex flex-col justify-center h-full max-w-2xl">
          
          {/* Text Content - Compact Version */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-[2px] bg-brand-orange" />
                <span className="text-brand-orange font-black uppercase tracking-[0.4em] text-[9px]">Logistique Régionale</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight">
                Zone de <span className="text-brand-orange">Livraison</span>
              </h2>
            </div>

            <p className="text-gray-400 text-base md:text-lg font-medium leading-relaxed max-w-lg">
              Notre service de livraison dessert exclusivement l'axe <span className="text-white font-bold">Trois-Rivières — Québec</span>. 
              La cueillette à notre entrepôt de Saint-Marc-des-Carrières demeure possible pour tous les secteurs.
            </p>

            <div className="flex flex-wrap gap-8 pt-2">
              <a 
                href="https://maps.google.com/?q=277+Boul.+Bona-Dussault,+Saint-Marc-des-Carrières,+QC+G0A+4B0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 group/hq transition-transform hover:scale-105"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange group-hover/hq:bg-brand-orange group-hover/hq:text-white transition-colors">
                  <MapPin size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-white font-black uppercase tracking-widest text-[10px] group-hover/hq:text-brand-orange transition-colors">Siège Social</h4>
                  <p className="text-gray-500 text-[10px] font-bold uppercase leading-tight">Saint-Marc-des-Carrières</p>
                </div>
              </a>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <Truck size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-white font-black uppercase tracking-widest text-[10px]">Zone Desservie</h4>
                  <p className="text-gray-500 text-[10px] font-bold uppercase leading-tight">Rayon de 100km</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Visual Overlay - Delivery Axis Line */}
      <div className="absolute bottom-12 right-12 hidden lg:block pointer-events-none">
        <div className="flex items-center gap-4 bg-brand-dark/80 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-2xl">
           <div className="space-y-1">
             <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">
               <span>TR</span>
               <span>QC</span>
             </div>
             <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative">
               <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-brand-orange rounded-full shadow-[0_0_10px_rgba(242,101,34,1)]" />
               <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/20 via-brand-orange to-brand-orange/20" />
             </div>
             <p className="text-[8px] text-brand-orange font-black uppercase tracking-widest text-center mt-2">Axe de Livraison Direct</p>
           </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-1/4 h-full bg-brand-orange/5 blur-[120px] pointer-events-none" />
    </section>
  );
}
