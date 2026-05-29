'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface InspiredNeonBannerProps {
  isVertical?: boolean;
}

export function InspiredNeonBanner({ isVertical = false }: InspiredNeonBannerProps) {
  const content = (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
      className={`relative w-full bg-[#050505] overflow-hidden flex h-full ${
        isVertical 
          ? 'flex-col items-center justify-between py-0 px-4 sm:px-6 text-center rounded-[1.75rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]' 
          : 'flex-col md:flex-row items-center justify-between p-8 md:p-20 rounded-[2rem]'
      } border border-white/10 group`}
    >
      {/* 1. Dynamic Mesh Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(236,72,153,0.15),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(236,72,153,0.1),transparent_70%)]" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        {/* Moving Light Leak */}
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-0 w-64 h-64 bg-pink-500/20 blur-[100px] rounded-full"
        />
      </div>

      {isVertical && <div className="h-6 sm:h-8 xl:h-12 w-full flex-shrink-0" />}

      {/* 2. Massive Vertical Title */}
      {isVertical ? (
        <div className="relative z-10 flex flex-col items-center justify-between flex-grow flex-1 h-full w-full">
          {/* Mobile Horizontal Title */}
          <motion.div 
            className="sm:hidden text-center flex flex-col justify-between py-2 flex-grow h-full"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
             <h2 
               className="text-white font-black uppercase tracking-[0.2em] text-3xl leading-none mb-2"
               style={{
                 textShadow: '0 0 15px rgba(236, 72, 153, 1), 0 0 30px rgba(236, 72, 153, 0.6)'
               }}
             >
               Enseigne<br/>Néon
             </h2>
             <p className="text-[10px] text-pink-500/80 font-bold uppercase tracking-widest max-w-[180px] mx-auto">
               Illuminez vos événements avec nos créations sur mesure.
             </p>
          </motion.div>
 
          {/* Desktop Vertical Title */}
          <motion.div 
            className="hidden sm:flex flex-col items-center justify-between flex-grow h-full w-full"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
             {/* Stacking letters with specialized font-weight and glow */}
             <div className="flex flex-col items-center justify-between flex-[2.5] w-full min-h-[38%]">
                {"ENSEIGNE".split('').map((char, i) => (
                  <motion.span 
                    key={i} 
                    animate={{ 
                      textShadow: [
                        '0 0 10px rgba(236,72,153,0.8), 0 0 20px rgba(236,72,153,0.4)',
                        '0 0 15px rgba(236,72,153,0.9), 0 0 30px rgba(236,72,153,0.6)',
                        '0 0 10px rgba(236,72,153,0.8), 0 0 20px rgba(236,72,153,0.4)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                    className="text-white font-black text-2xl sm:text-3xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl select-none leading-none"
                  >
                    {char}
                  </motion.span>
                ))}
             </div>
             
             {/* Dynamic Gap between the two words */}
             <div className="h-4 sm:h-5 xl:h-8 flex-shrink-0" />

             <div className="flex flex-col items-center justify-between flex-1 w-full min-h-[16%]">
                {"NÉON".split('').map((char, i) => (
                  <motion.span 
                    key={char + i} 
                    animate={{ 
                      textShadow: [
                        '0 0 10px rgba(236,72,153,0.8), 0 0 20px rgba(236,72,153,0.4)',
                        '0 0 15px rgba(236,72,153,0.9), 0 0 30px rgba(236,72,153,0.6)',
                        '0 0 10px rgba(236,72,153,0.8), 0 0 20px rgba(236,72,153,0.4)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: (i + 8) * 0.1 }}
                    className="text-white font-black text-2xl sm:text-3xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl select-none leading-none"
                  >
                    {char}
                  </motion.span>
                ))}
             </div>
             
             <div className="h-6 sm:h-8 xl:h-12 flex-shrink-0" />
 
             <p className="text-[10px] sm:text-xs xl:text-xs 5xl:text-xl text-pink-500 font-bold uppercase tracking-[0.3em] max-w-[120px] sm:max-w-[150px] xl:max-w-[160px] 5xl:max-w-[300px] mx-auto leading-relaxed opacity-80 flex-shrink-0">
               Illuminez vos événements avec nos créations sur mesure.
             </p>
          </motion.div>
        </div>
      ) : (
        /* Horizontal Title (Unchanged logic but upgraded style) */
        <div className="relative z-10 flex-shrink-0 mb-10 md:mb-0 text-center md:text-left">
          <h2 
            className="text-white font-black uppercase tracking-[0.2em] text-4xl sm:text-5xl md:text-7xl lg:text-8xl 5xl:text-[9.5rem] leading-none"
            style={{
              textShadow: '0 0 20px rgba(236, 72, 153, 1), 0 0 40px rgba(236, 72, 153, 0.6)'
            }}
          >
            Enseigne<br/>Néon
          </h2>
          <p className="mt-6 text-sm md:text-xl 5xl:text-4xl text-pink-500 font-bold uppercase tracking-[0.3em] opacity-80 max-w-md 5xl:max-w-4xl">
            Illuminez vos événements avec nos créations sur mesure.
          </p>
          <div className="mt-8 flex justify-center md:justify-start space-x-3">
             {[1,2,3].map(i => <div key={i} className="h-1.5 w-12 bg-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,1)]" />)}
          </div>
        </div>
      )}
 
      {/* 3. Refined Bottom Content */}
      <div className={`relative z-10 flex flex-col ${
         isVertical ? 'items-center text-center space-y-4 mt-6' : 'items-center md:items-end text-center md:text-right space-y-8'
      }`}>
        <div className="flex-grow" />
        
        <Link 
          href="/categories/enseigne-neon"
          className={`group/link relative overflow-hidden transition-all duration-500 ${
            isVertical 
              ? 'px-8 py-5 5xl:px-20 5xl:py-12 text-xs 5xl:text-2xl font-black text-white tracking-[0.2em] uppercase border border-pink-500/50 bg-pink-500/10 hover:bg-pink-500 hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] rounded-xl' 
              : 'px-12 py-6 5xl:px-28 5xl:py-14 text-sm 5xl:text-3xl font-black text-white tracking-[0.3em] uppercase border-2 border-pink-500 hover:bg-pink-500 hover:shadow-[0_0_50px_rgba(236,72,153,0.6)] rounded-full'
          }`}
        >
          <span className="relative z-10">Voir l'inventaire</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-1000" />
        </Link>
      </div>

      {isVertical && <div className="h-6 sm:h-8 xl:h-12 w-full flex-shrink-0" />}
    </motion.div>
  );

  if (isVertical) return content;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 max-w-7xl 4xl:max-w-[90rem] 5xl:max-w-[140rem]">
        {content}
      </div>
    </section>
  );
}
