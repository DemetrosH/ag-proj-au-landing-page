'use client';

import React from 'react';
import { useRental } from '../context/RentalContext';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { Product } from '../lib/rentman';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { durationInDays, isDateSet } = useRental();
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const totalPrice = product.price * durationInDays;

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-20">
      {/* Left: Image Gallery */}
      <div className="lg:w-1/2">
        <Link href={`/categories/${product.categoryId}`} className="text-sm font-bold text-brand-gold uppercase tracking-widest mb-8 inline-block hover:underline">
          ← Retour à la catégorie
        </Link>
        
        <div className="aspect-[4/5] bg-brand-surface rounded-[3rem] overflow-hidden border border-brand-border flex items-center justify-center text-brand-gold/5 relative">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-40 h-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      </div>

      {/* Right: Info & Pricing */}
      <div className="lg:w-1/2 pt-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{product.name}</h1>
        <div 
          className="text-xl text-gray-500 mb-10 leading-relaxed prose-brand"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />

        <div className="bg-brand-surface rounded-[2.5rem] p-10 mb-10 border border-brand-border/50">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Prix de base</span>
              <span className="text-4xl font-bold text-gray-900">{product.price}$ <span className="text-lg font-normal text-gray-400">/ jour</span></span>
            </div>
            {isDateSet && (
              <div className="text-right">
                <span className="block text-xs font-bold uppercase tracking-widest text-brand-gold mb-1">{durationInDays} jours</span>
                <span className="text-2xl font-bold text-brand-gold">Total: {totalPrice}$</span>
              </div>
            )}
          </div>

          {!isDateSet && (
            <div className="p-4 bg-brand-peach/30 rounded-xl mb-8 flex items-center gap-3 border border-brand-peach">
              <svg className="w-5 h-5 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-brand-gold">Sélectionnez vos dates pour voir le prix total.</p>
            </div>
          )}

          <button 
            onClick={handleAddToCart}
            className={`w-full py-5 text-lg shadow-xl flex items-center justify-center gap-3 transition-all duration-300 ${
              added 
                ? 'bg-green-500 text-white shadow-green-200 rounded-2xl' 
                : 'btn-primary shadow-brand-gold/20'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {added ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            {added ? 'Ajouté !' : 'Ajouter à la soumission'}
          </button>
        </div>

        {product.features.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold uppercase tracking-widest">Caractéristiques</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.features
                .filter(feature => !['location-a', 'location-b', 'location-c', 'populaire', 'produits-vedette', 'uncategorized'].includes(feature.toLowerCase()))
                .map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-600">
                  <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
