'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Check } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { Product } from '../../../lib/rentman';

interface CategoryProductListProps {
  products: Product[];
}

export function CategoryProductList({ products }: CategoryProductListProps) {
  const { addToCart } = useCart();
  const [addedId, setAddedId] = React.useState<string | null>(null);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(product);

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  if (products.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed border-brand-border rounded-[3rem]">
        <p className="text-gray-400 font-medium">Bientôt disponible dans cette catégorie.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
      {products.map((product) => (
        <div key={product.id} className="relative group h-full">
          {/* Quick Add Button - MOVED OUTSIDE LINK */}
          <button 
            onClick={(e) => handleQuickAdd(e, product)}
            disabled={product.stock_level !== undefined && product.stock_level <= 0}
            className={`absolute top-2 right-2 sm:top-6 sm:right-6 w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center z-50 transition-all shadow-2xl ${
              addedId === product.id 
              ? 'bg-green-500 text-white scale-110 opacity-100' 
              : product.stock_level !== undefined && product.stock_level <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-white text-brand-dark hover:bg-brand-orange hover:text-white sm:opacity-0 group-hover:opacity-100 opacity-100'
            }`}
            aria-label="Ajouter au panier"
          >
            {addedId === product.id ? <Check size={16} strokeWidth={3} className="sm:w-6 sm:h-6" /> : <Plus size={20} strokeWidth={3} className="sm:w-7 sm:h-7" />}
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
                <div className="w-full h-full flex items-center justify-center text-brand-gold/10 group-hover:scale-110 transition-transform duration-700">
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
              <h3 className="text-sm sm:text-2xl font-bold mb-1 sm:mb-3 group-hover:text-brand-gold transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-0">{product.name}</h3>
              <div className="flex items-center justify-between pt-2 sm:pt-6 border-t border-brand-border">
                <span className="text-[8px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">Détails</span>
                <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-brand-gold text-white flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
