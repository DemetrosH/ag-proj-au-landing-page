'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '../lib/supabase/client';
import { client as sanityClient } from '../lib/sanity';

const features = [
  {
    parts: [
      { text: "Scène", href: "/categories/scene" },
      { text: "&", href: null },
      { text: "structure", href: "/categories/scene" }
    ]
  },
  {
    parts: [
      { text: "Ameublement", href: "/categories/ameublements" },
      { text: "&", href: null },
      { text: "décor", href: "/categories/ameublements" }
    ]
  },
  {
    parts: [
      { text: "Sonorisation", href: "/categories/sonorisation" },
      { text: "&", href: null },
      { text: "éclairage", href: "/categories/eclairage" }
    ]
  },
  {
    parts: [
      { text: "Vidéo", href: "/categories/video" },
      { text: "&", href: null },
      { text: "technologie", href: "/categories/video" }
    ]
  },
  {
    parts: [
      { text: "Enseigne Néon", href: "/categories/enseigne-neon" },
      { text: "sur mesure", href: null }
    ]
  },
  {
    parts: [
      { text: "Chapiteaux", href: "/categories/chapiteaux" },
      { text: "&", href: null },
      { text: "abris", href: "/categories/chapiteaux" }
    ]
  }
];

export function InspiredHero() {
  const [heroProducts, setHeroProducts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchHeroProducts = async () => {
      // 0. Default Fallback List (Always ready)
      const fallbackItems = [
        { name: "Machine à popcorn commerciale 12 Oz", rentmanId: "8035", label: "Populaire" },
        { name: "Machine à slush (simple)", rentmanId: "5459", label: "Nouveauté" },
        { name: "Chapiteau 10 x 10 pi, rouge et blanc ", rentmanId: "1519", label: "Essentiel" },
        { name: "KIT - Prise de parole (2 caisses de son, 2 pieds pour caisse de son, 1 micro, 1 pied de micro, console)", rentmanId: "1610", label: "Pro Audio" },
        { name: "Scène portative – 48 x 48 po (stage)", rentmanId: "4766", label: "Structure" },
        { name: "Jeux de lancer de haches et fléchettes", rentmanId: "8034", label: "Animation" }
      ];

      try {
        // 1. Fetch Carousel Config from Sanity
        let productsToFetch = fallbackItems;
        
        try {
          const sanityConfig = await sanityClient.fetch(`*[_type == "heroCarousel"][0]`);
          if (sanityConfig?.items?.length > 0) {
            productsToFetch = sanityConfig.items;
          }
        } catch (sErr) {
          console.warn("Sanity fetch failed, using fallbacks:", sErr);
        }
        
        // 2. Fetch from Supabase with Category Data - Simplified Query
        const rentmanIds = productsToFetch.map(item => item.rentmanId).filter(Boolean);
        
        console.log("Hero: Fetching IDs:", rentmanIds);

        const { data: supabaseData, error } = await supabase
          .from('products')
          .select('*, categories (name, slug)')
          .in('rentman_id', rentmanIds);

        if (error) {
          console.error("Supabase Error in Hero:", error);
        }

        console.log("Hero: Data received:", supabaseData?.length || 0, "items");

        if (supabaseData && supabaseData.length > 0) {
          // Map back to include labels and maintain order
          const finalProducts = productsToFetch.map(item => {
            const match = supabaseData.find(p => p.rentman_id === item.rentmanId);
            if (!match) console.warn(`Hero: No match found in DB for ID ${item.rentmanId}`);
            return match ? { ...match, heroLabel: item.label || 'Vedette' } : null;
          }).filter(Boolean);

          console.log("Hero: Final products count:", finalProducts.length);
          setHeroProducts(finalProducts);
        } else {
          console.warn("Hero: Supabase returned no data, using emergency fallback");
          const { data: emergencyData } = await supabase.from('products').select('*, categories(name, slug)').limit(6);
          if (emergencyData) setHeroProducts(emergencyData);
        }
      } catch (err) {
        console.error("Hero product fetch error:", err);
      }
    };

    fetchHeroProducts();
  }, []);

  useEffect(() => {
    if (heroProducts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroProducts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroProducts]);

  return (
    <section className="relative pt-32 pb-20 overflow-x-clip bg-white">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-gray/50 -skew-x-6 translate-x-1/4 z-0" />
      
      <div className="container mx-auto px-4 max-w-7xl 4xl:max-w-[90rem] 5xl:max-w-[140rem] relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Column: Content */}
          <div className="lg:w-1/2 relative z-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-20"
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl 5xl:text-[10rem] font-black text-brand-dark uppercase tracking-tight md:tracking-tighter leading-[1.1] md:leading-[0.9] mb-8 text-balance">
                Votre Expertise, <br />
                Notre <span className="text-brand-orange">Équipement</span>
              </h1>
              
              <p className="text-lg md:text-xl 5xl:text-4xl text-gray-600 mb-10 leading-relaxed font-medium">
                Artéfact Urbain est votre partenaire technique pour tous vos besoins en location d'équipement événementiel. Nous assurons la réussite visuelle et logistique de vos projets.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5 mb-10">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-orange/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="font-bold text-brand-dark uppercase text-[11px] tracking-widest flex flex-wrap gap-x-1">
                      {feature.parts.map((part, pi) => (
                        part.href ? (
                          <Link 
                            key={pi} 
                            href={part.href} 
                            className="hover:text-brand-orange hover:underline transition-colors decoration-2 underline-offset-4"
                          >
                            {part.text}
                          </Link>
                        ) : (
                          <span key={pi}>{part.text}</span>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <Link href="/categories" className="bg-brand-dark text-white font-black uppercase tracking-[0.2em] px-10 py-5 5xl:px-20 5xl:py-10 rounded-full hover:bg-brand-orange transition-all shadow-xl shadow-brand-dark/10 text-center text-xs 5xl:text-2xl">
                  Parcourir l'inventaire
                </Link>
                <Link href="/contact" className="bg-white border-2 border-brand-dark text-brand-dark font-black uppercase tracking-[0.2em] px-10 py-5 5xl:px-20 5xl:py-10 rounded-full hover:bg-brand-dark hover:text-white transition-all text-center text-xs 5xl:text-2xl">
                  Demander un devis
                </Link>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column: Visual Card */}
          <div className="lg:w-1/2 relative z-10 overflow-visible">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative aspect-square md:aspect-video lg:aspect-[4/5] w-full max-w-lg 5xl:max-w-3xl mx-auto overflow-visible"
            >
              {/* Main Gradient Card - Animated Liquid Effect */}
              <motion.div 
                animate={{ 
                  background: [
                    "linear-gradient(to bottom right, #00B2CA, #00D2EA)",
                    "linear-gradient(to bottom right, #00D2EA, #00B2CA)",
                    "linear-gradient(to bottom right, #00B2CA, #00D2EA)"
                  ]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute inset-0 rounded-[3rem] shadow-2xl overflow-hidden"
              >
                {/* Drifting Pattern */}
                <motion.div 
                  animate={{ 
                    x: [0, -40, 0],
                    y: [0, -40, 0]
                  }}
                  transition={{ 
                    duration: 15, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute -inset-20 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] rounded-[3rem]" 
                />



                {/* Pulsing Corner Hazards */}
                <div className="absolute top-0 left-0 w-24 h-24 opacity-30">
                   <div className="w-full h-full" style={{ 
                      backgroundImage: 'linear-gradient(135deg, #fff 25%, transparent 25%, transparent 50%, #fff 50%, #fff 75%, transparent 75%, transparent)',
                      backgroundSize: '20px 20px'
                   }} />
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 opacity-30 rotate-180">
                   <div className="w-full h-full" style={{ 
                      backgroundImage: 'linear-gradient(135deg, #F7A831 25%, transparent 25%, transparent 50%, #F7A831 50%, #F7A831 75%, transparent 75%, transparent)',
                      backgroundSize: '20px 20px'
                   }} />
                </div>

                {/* Electric Neon Borders - Thick & Glowing */}
                <motion.div 
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(247,168,49,0.5), inset 0 0 20px rgba(247,168,49,0.5)",
                      "0 0 40px rgba(247,168,49,0.8), inset 0 0 40px rgba(247,168,49,0.8)",
                      "0 0 20px rgba(247,168,49,0.5), inset 0 0 20px rgba(247,168,49,0.5)"
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-4 border-4 border-brand-orange rounded-[2.5rem] z-10"
                />
                
                {/* Central Floating Product Carousel */}
                <div className="absolute inset-0 z-20 flex items-center justify-center p-8">
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ 
                      duration: 6, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="w-full max-w-[280px] sm:max-w-xs 5xl:max-w-[32rem] bg-white rounded-[2.5rem] 5xl:rounded-[4rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] p-6 5xl:p-12 border border-white/50 relative group"
                  >
                    {/* Status Badge */}
                    {heroProducts.length > 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg z-20">
                        {heroProducts[currentIndex]?.heroLabel || 'Vedette'}
                      </div>
                    )}

                    <AnimatePresence mode="wait">
                      {heroProducts.length > 0 && (
                        <motion.div
                          key={heroProducts[currentIndex].id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          transition={{ duration: 0.6 }}
                          className="relative z-30"
                        >
                          {/* Image Container */}
                          <div className="aspect-square bg-white rounded-[2rem] overflow-hidden mb-4 p-4 flex items-center justify-center border border-brand-border/20">
                            {heroProducts[currentIndex].image_url ? (
                              <img 
                                src={heroProducts[currentIndex].image_url} 
                                alt={heroProducts[currentIndex].name} 
                                className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="text-[10px] text-gray-300 italic">Image indisponible</div>
                            )}
                          </div>

                          {/* Info Section */}
                          <div className="space-y-1.5 text-center">
                            {/* Category Badge - Nuclear Click Fix */}
                            <div className="min-h-[24px] relative z-40">
                              {heroProducts[currentIndex].categories ? (
                                <Link 
                                  href={`/categories/${heroProducts[currentIndex].categories.slug}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="relative z-50 text-[9px] font-black bg-brand-orange/10 text-brand-orange px-3 py-1.5 rounded-md hover:bg-brand-orange hover:text-white transition-all uppercase tracking-widest inline-block cursor-pointer pointer-events-auto"
                                >
                                  {heroProducts[currentIndex].categories.name}
                                </Link>
                              ) : (
                                <span className="text-[9px] font-black bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md uppercase tracking-widest inline-block">
                                  Location
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm font-black text-brand-dark uppercase tracking-tight leading-tight line-clamp-2 min-h-[2.5rem]">
                              {heroProducts[currentIndex].name}
                            </h3>
                            
                            <div className="flex items-center justify-center gap-4 pt-1">
                              <div className="text-lg font-black text-brand-dark">
                                {heroProducts[currentIndex].price}$
                                <span className="text-[10px] font-bold text-gray-400 ml-1">/ jour</span>
                              </div>
                              
                              <Link 
                                href={`/products/${heroProducts[currentIndex].rentman_id || heroProducts[currentIndex].id}`}
                                className="w-10 h-10 rounded-full bg-brand-dark text-white flex items-center justify-center hover:bg-brand-orange transition-all shadow-xl group-hover:translate-x-1"
                              >
                                <span className="text-xl">→</span>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Navigation Dots */}
                    <div className="flex justify-center gap-1.5 mt-6">
                      {heroProducts.map((_, idx) => (
                        <div 
                          key={idx}
                          className={`h-1 rounded-full transition-all duration-500 ${
                            idx === currentIndex ? 'w-4 bg-brand-orange' : 'w-1 bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>


              </motion.div>
              
              {/* Decorative side element with Logo */}
              <Link href="https://artefacturbain.ca" target="_blank" rel="noopener noreferrer">
                <motion.div 
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="hidden lg:flex absolute -bottom-6 -left-6 w-24 h-24 bg-white rounded-3xl z-30 shadow-2xl items-center justify-center p-4 border-4 border-brand-orange cursor-pointer"
                >
                  <img 
                    src="/location/logo2-A.png" 
                    alt="Artéfact Urbain" 
                    className="w-full h-full object-contain" 
                  />
                </motion.div>
              </Link>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
