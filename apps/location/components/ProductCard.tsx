'use client';

import React from 'react';
import { Product } from '../lib/rentman';
import Link from 'next/link';
import { ArrowRight, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

import { useRental } from '../context/RentalContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, getItemQuantity } = useCart();
  const { isDateSet } = useRental();
  const [added, setAdded] = React.useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentInCart = getItemQuantity(product.id);
    const available = product.stock_level !== undefined ? product.stock_level - currentInCart : 999;

    if (available > 0) {
      addToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <Link 
      href={`/products/${product.id}`} 
      className="group flex flex-col w-[160px] md:w-[200px] 5xl:w-[450px] flex-shrink-0"
    >
      <div className="aspect-[3/4] bg-white border border-gray-100 rounded-2xl overflow-hidden mb-4 relative transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1">
        
        {/* Quick Add Button */}
        {(() => {
          const currentInCart = getItemQuantity(product.id);
          const available = product.stock_level !== undefined ? product.stock_level - currentInCart : 999;
          const isOutOfStock = product.stock_level !== undefined && product.stock_level <= 0;
          const isLimitReached = product.stock_level !== undefined && available <= 0 && !isOutOfStock;

          if (isOutOfStock) {
            return (
              <div className="absolute top-3 right-3 px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase z-30 shadow-sm border border-red-200">
                Épuisé
              </div>
            );
          }

          return (
            <button 
              onClick={handleQuickAdd}
              disabled={available <= 0}
              className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center z-30 transition-all shadow-lg ${
                added 
                ? 'bg-green-500 text-white scale-110 opacity-100' 
                : available <= 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-white text-brand-dark hover:bg-brand-orange hover:text-white group-hover:scale-100 scale-90 sm:opacity-0 group-hover:opacity-100 opacity-100'
              }`}
            >
              {added ? (
                <Check size={18} strokeWidth={3} />
              ) : isLimitReached ? (
                <span className="text-[10px] font-black leading-none">MAX</span>
              ) : (
                <Plus size={20} strokeWidth={3} />
              )}
            </button>
          );
        })()}

        {/* Clean background to ensure no delineation */}
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain p-5 transform transition-transform duration-700 group-hover:scale-110 relative z-10 mix-blend-multiply"
          />
        ) : (
          <div className="w-full h-full bg-white flex items-center justify-center text-gray-300 relative z-10">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
          </div>
        )}

        {/* Hover Overlay with Icon */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col justify-end p-4">
           <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between">
             <span className="text-white text-xs font-bold uppercase tracking-wider">Détails</span>
             <div className="w-8 h-8 rounded-full bg-brand-gold text-white flex items-center justify-center">
               <ArrowRight size={14} />
             </div>
           </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-1.5 px-1">
        <h4 className="text-sm 5xl:text-3xl font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-brand-gold transition-colors">
          {product.name}
        </h4>
        <p className="text-xs 5xl:text-2xl font-medium text-gray-500">
          À partir de <span className="text-gray-900 font-black">{product.price > 0 ? `${product.price.toFixed(2)} $` : '---'}</span>
        </p>
      </div>
    </Link>
  );
}
