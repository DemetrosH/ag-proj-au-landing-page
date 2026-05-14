'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '../lib/rentman';
import { CategoryConfig } from './LandingPage';

interface CategoryCardProps {
  category: Category;
  config?: CategoryConfig;
  index: number;
}

const borderColors = [
  "border-[#00AFEC]", // Cyan
  "border-[#E91E63]", // Magenta
  "border-[#F7A831]", // Orange
  "border-[#4CAF50]", // Green
  "border-[#9C27B0]", // Purple
];

const featuredProductKeywords: Record<string, string[]> = {
  "alimentaire": ["papa", "slush", "popcorn", "hot dog"],
  "chapiteaux": ["10x10", "mur", "photo", "poids"],
  "ameublements": ["table", "chaise", "tabouret", "mange"],
  "mobilier": ["table", "chaise", "tabouret", "mange"],
  "ameublement": ["table", "chaise", "tabouret", "mange"],
  "equipements electriques": ["passe", "rallonge", "panneau", "generatrice"],
  "sonorisation": ["qsc", "micro", "pied", "console"],
  "enseigne neon": ["tatou", "bonbon", "neon", "enseigne"],
  "video": ["tv", "ecran", "trepied", "projecteur"],
  "scene": ["praticable", "marche", "jupe", "garde"],
  "eclairage": ["led", "trepied", "lumiere", "dmx"],
  "signaletique": ["potelet", "corde", "chevalet", "panneau"],
  "jeux": ["hache", "cornhole", "geant", "puissance"],
  "blocs d'alimentation": ["ecoflow", "jackery", "batterie", "power"],
  "batteries": ["ecoflow", "jackery", "batterie", "power"],
  "poids": ["base", "pe30", "poids", "sable"],
  "supports": ["base", "pe30", "poids", "sable"]
};

export function CategoryCard({ category, config: providedConfig, index }: CategoryCardProps) {
  const normalizedCatName = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // 0. Use provided config OR try to find one by normalized name if providedConfig is missing
  // This is a safety measure in case the parent didn't find it correctly
  const config = providedConfig;

  // 1. Content Overrides
  const displayTitle = config?.title || category.name;

  // 2. Featured Products Selection
  const availableProducts = [...(category.products || [])];
  const displayProducts: any[] = [];

  // A. Try Sanity featured products first - ONLY if they have an image
  if (config?.featuredProducts && config.featuredProducts.length > 0) {
    config.featuredProducts.forEach(fp => {
      if (displayProducts.length >= 4) return;
      
      const rentmanProduct = availableProducts.find(p => p.slug === String(fp.slug) || String(p.id) === String(fp.slug));
      const imageUrl = fp.imageUrl || rentmanProduct?.image;
      
      if (imageUrl) {
        displayProducts.push({
          slug: fp.slug,
          name: fp.name,
          image: imageUrl
        });

        // Remove from available so we don't duplicate
        if (rentmanProduct) {
          const idx = availableProducts.indexOf(rentmanProduct);
          if (idx > -1) availableProducts.splice(idx, 1);
        }
      }
    });
  }

  // B. Fill with keywords - Prioritize products WITH images
  if (displayProducts.length < 4) {
    let keywords: string[] = [];
    const normalizedCatName = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    
    for (const [key, kw] of Object.entries(featuredProductKeywords)) {
      const normalizedKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      if (normalizedCatName.includes(normalizedKey) || normalizedKey.includes(normalizedCatName)) {
        keywords = kw;
        break;
      }
    }

    keywords.forEach((kw) => {
      if (displayProducts.length >= 4) return;
      const matchIndex = availableProducts.findIndex(p => 
        p.image && (p.name.toLowerCase().includes(kw) || p.slug.toLowerCase().includes(kw))
      );
      if (matchIndex !== -1) {
        displayProducts.push(availableProducts[matchIndex]);
        availableProducts.splice(matchIndex, 1);
      }
    });
  }

  // C. Fill remaining slots with whatever has an image left
  const withImages = availableProducts.filter(p => p.image);
  while (displayProducts.length < 4 && withImages.length > 0) {
    displayProducts.push(withImages.shift());
  }

  // D. Absolute fallback - if still empty, take anything
  while (displayProducts.length < 4 && availableProducts.length > 0) {
    displayProducts.push(availableProducts.shift());
  }

  const borderColor = borderColors[index % borderColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className={`group bg-white border-t-8 ${borderColor} shadow-xl hover:shadow-2xl transition-all duration-500 rounded-b-[2rem] rounded-t-lg overflow-hidden flex flex-col h-full`}
    >
      {/* 2x2 Product Thumbnail Grid */}
      <div className="grid grid-cols-2 bg-white aspect-square border-b border-gray-200">
        {[0, 1, 2, 3].map((i) => {
          const product = displayProducts[i];

          return (
            <div key={i} className="relative border-[0.5px] border-gray-200 flex items-center justify-center p-2 sm:p-6 overflow-hidden transition-all duration-500 group/item">
              {product && product.image ? (
                <Link href={`/products/${product.slug}`} className="relative w-full h-full block transform group-hover/item:scale-110 transition-transform duration-500">
                  <Image 
                    src={product.image} 
                    alt={product.name}
                    fill
                    className="object-contain p-1 sm:p-2"
                    sizes="(max-width: 768px) 25vw, 15vw"
                  />
                </Link>
              ) : (
                <div className="text-gray-200 uppercase font-black text-[8px] sm:text-[10px] tracking-widest text-center">
                  {displayTitle.split(' ')[0]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5 flex flex-col flex-grow bg-gray-50 border-t border-gray-200">
        <h3 className="text-sm sm:text-xl font-black text-brand-dark uppercase tracking-tight mb-4 group-hover:text-brand-orange transition-colors line-clamp-1">
          {displayTitle}
        </h3>
        
        <div className="flex-grow" />
        
        <Link 
          href={`/categories/${category.slug}`}
          className="flex items-center justify-between w-full p-2 sm:p-3 rounded-lg bg-brand-dark text-white font-bold uppercase tracking-widest text-[8px] sm:text-[10px] hover:bg-brand-orange transition-colors group/btn shadow-md"
        >
          <span>Voir</span>
          <svg className="w-2 h-2 sm:w-3 sm:h-3 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
}
