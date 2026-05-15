'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Category } from '../lib/rentman';
import { CategoryConfig } from './LandingPage';
import { Plus, Check, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

interface CategoryFilterLayoutProps {
  categories: Category[];
  allProducts: Product[];
  categoryConfigs?: CategoryConfig[];
}

export function CategoryFilterLayout({ categories, allProducts, categoryConfigs = [] }: CategoryFilterLayoutProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, getItemQuantity } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter products based on category and search query
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory || product.category_slugs?.includes(selectedCategory);
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => (b.price || 0) - (a.price || 0));
  }, [allProducts, selectedCategory, searchQuery]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentInCart = getItemQuantity(product.id);
    const available = product.stock_level !== undefined ? product.stock_level - currentInCart : 999;
    
    if (available > 0) {
      addToCart(product);
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 2000);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 200 : scrollLeft + 200;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col space-y-12">
      {/* Search and Filters Header */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md pt-4 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] 5xl:max-w-[3200px] mx-auto space-y-6">
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto sm:mx-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium"
            />
          </div>

          {/* Category Pills */}
          <div className="relative group">
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-2 scrollbar-hide space-x-3 mask-fade-right"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                  selectedCategory === 'all' 
                  ? 'bg-brand-dark text-white shadow-lg' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                Tous
              </button>
              
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`flex-shrink-0 px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                    selectedCategory === category.slug 
                    ? 'bg-brand-orange text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* Scroll Buttons - Only visible on hover/desktop */}
            <button 
              onClick={() => scroll('left')}
              className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-xl rounded-full hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-xl rounded-full hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="min-h-[400px]">
        {filteredProducts.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-8 5xl:grid-cols-10 gap-4 sm:gap-8"
          >
            <AnimatePresence mode='popLayout'>
              {filteredProducts.map((product) => {
                const currentInCart = getItemQuantity(product.id);
                const available = product.stock_level !== undefined ? product.stock_level - currentInCart : 999;
                const isOutOfStock = product.stock_level !== undefined && product.stock_level <= 0;
                const isLimitReached = product.stock_level !== undefined && available <= 0 && !isOutOfStock;

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative group h-full"
                  >
                    {/* Quick Add Button */}
                    <button 
                      onClick={(e) => handleQuickAdd(e, product)}
                      disabled={available <= 0}
                      className={`absolute top-2 right-2 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center z-10 transition-all shadow-2xl ${
                        addedId === product.id 
                        ? 'bg-green-500 text-white scale-110 opacity-100' 
                        : available <= 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-white text-brand-dark hover:bg-brand-orange hover:text-white sm:opacity-0 group-hover:opacity-100 opacity-100'
                      }`}
                    >
                      {addedId === product.id ? (
                        <Check size={16} strokeWidth={3} />
                      ) : isLimitReached ? (
                        <span className="text-[10px] font-black leading-none">MAX</span>
                      ) : (
                        <Plus size={20} strokeWidth={3} />
                      )}
                    </button>

                  <Link 
                    href={`/products/${product.slug}`}
                    className="block border border-brand-border rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 bg-white h-full"
                  >
                    <div className="aspect-[4/3] bg-white relative overflow-hidden flex items-center justify-center p-4 sm:p-8">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-gold/10">
                          <svg className="w-12 h-12 sm:w-20 sm:h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="absolute top-2 left-2 sm:top-6 sm:left-6">
                        <span className="bg-white/90 backdrop-blur-md px-2 py-1 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold shadow-sm">
                          {product.price}$
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-8">
                      <h3 className="text-sm sm:text-xl font-bold mb-1 sm:mb-3 group-hover:text-brand-orange transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-0">{product.name}</h3>
                      <div className="flex items-center justify-between pt-2 sm:pt-6 border-t border-brand-border">
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">Détails</span>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center transform group-hover:scale-110 transition-transform">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-40 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 text-gray-300 mb-6">
              <Search size={32} />
            </div>
            <h3 className="text-2xl font-bold text-brand-dark mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-500 font-medium">Essayez de modifier votre recherche ou de changer de catégorie.</p>
            <button 
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-8 text-brand-orange font-bold uppercase tracking-widest text-xs hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
