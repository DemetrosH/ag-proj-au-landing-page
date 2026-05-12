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
      className={`relative w-full bg-[#050505] overflow-hidden flex h-full ${
        isVertical 
          ? 'flex-col items-center justify-between py-12 px-6 text-center rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]' 
          : 'flex-col md:flex-row items-center justify-between p-8 md:p-20 rounded-[2rem] md:rounded-[3rem]'
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

      {/* 2. Massive Vertical Title */}
      {isVertical ? (
        <div className="relative z-10 flex flex-col items-center justify-center space-y-12 flex-grow">
          <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
             {/* Stacking letters with specialized font-weight and glow */}
             <div className="flex flex-col items-center leading-[0.75] mb-8">
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
                    className="text-white font-black text-4xl sm:text-5xl md:text-6xl select-none"
                  >
                    {char}
                  </motion.span>
                ))}
             </div>
             <div className="flex flex-col items-center leading-[0.75]">
                {"NÉON".split('').map((char, i) => (
                  <motion.span 
                    key={i} 
                    animate={{ 
                      textShadow: [
                        '0 0 10px rgba(236,72,153,0.8), 0 0 20px rgba(236,72,153,0.4)',
                        '0 0 15px rgba(236,72,153,0.9), 0 0 30px rgba(236,72,153,0.6)',
                        '0 0 10px rgba(236,72,153,0.8), 0 0 20px rgba(236,72,153,0.4)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: (i + 8) * 0.1 }}
                    className="text-white font-black text-4xl sm:text-5xl md:text-6xl select-none"
                  >
                    {char}
                  </motion.span>
                ))}
             </div>
          </motion.div>
        </div>
      ) : (
        /* Horizontal Title (Unchanged logic but upgraded style) */
        <div className="relative z-10 flex-shrink-0 mb-10 md:mb-0 text-center md:text-left">
          <h2 
            className="text-white font-black uppercase tracking-[0.2em] text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-none"
            style={{
              textShadow: '0 0 20px rgba(236, 72, 153, 1), 0 0 40px rgba(236, 72, 153, 0.6)'
            }}
          >
            Enseigne<br/>Néon
          </h2>
          <div className="mt-6 flex justify-center md:justify-start space-x-3">
             {[1,2,3].map(i => <div key={i} className="h-1.5 w-12 bg-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,1)]" />)}
          </div>
        </div>
      )}

      {/* 3. Refined Bottom Content */}
      <div className={`relative z-10 flex flex-col ${
        isVertical ? 'items-center text-center space-y-8 mt-12' : 'items-center md:items-end text-center md:text-right space-y-8'
      }`}>
        <p className={`text-white font-bold tracking-tight uppercase ${isVertical ? 'text-[10px] opacity-60 leading-tight' : 'text-lg opacity-80'} max-w-[200px]`}>
          Illuminez vos événements <br className="hidden md:block" /> avec nos créations sur mesure.
        </p>
        
        <Link 
          href="/categories/enseigne-neon"
          className={`group/link relative overflow-hidden transition-all duration-500 ${
            isVertical 
              ? 'px-8 py-5 text-[11px] font-black text-white tracking-[0.2em] uppercase border border-pink-500/50 bg-pink-500/10 hover:bg-pink-500 hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] rounded-xl' 
              : 'px-12 py-6 text-sm font-black text-white tracking-[0.3em] uppercase border-2 border-pink-500 hover:bg-pink-500 hover:shadow-[0_0_50px_rgba(236,72,153,0.6)] rounded-full'
          }`}
        >
          <span className="relative z-10">Voir l'inventaire</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-1000" />
        </Link>
      </div>
    </motion.div>
  );

  if (isVertical) return content;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {content}
      </div>
    </section>
  );
}
