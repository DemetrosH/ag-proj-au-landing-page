'use client';

import React from 'react';
import { useRental } from '../context/RentalContext';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { Product } from '../lib/rentman';

import { calculateRentalFactor, RENTAL_COEFFICIENTS } from '../lib/pricing';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { durationInDays, isDateSet } = useRental();
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const factor = calculateRentalFactor(durationInDays);
  const totalPrice = Math.round(product.price * factor);
  const savings = isDateSet && durationInDays > 1 
    ? Math.round((product.price * durationInDays) - totalPrice) 
    : 0;

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const formatDescription = (text: string) => {
    if (!text) return "";
    
    // If it's already HTML (contains common tags), return as is
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return text;
    }
    
    // Otherwise, handle newlines and common list markers
    const lines = text.split('\n');
    let inList = false;
    let html = '';

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += '<br />';
        return;
      }

      // Check if line starts with a list marker
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${trimmed.substring(1).trim()}</li>`;
      } else {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<p>${trimmed}</p>`;
      }
    });

    if (inList) html += '</ul>';
    return html;
  };

  return (
    <div className="flex flex-col">
      {/* Main Product Section: Image and Info */}
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
            className="prose-brand mb-10"
            dangerouslySetInnerHTML={{ __html: formatDescription(product.description) }}
          />

          <div className="bg-brand-surface rounded-[2.5rem] p-10 mb-10 border border-brand-border/50">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Prix de base</span>
                <span className="text-4xl font-bold text-gray-900">{product.price}$ <span className="text-lg font-normal text-gray-400">/ jour</span></span>
              </div>
              <div className="text-right">
                {isDateSet ? (
                  <div className="flex flex-col items-end">
                    <span className="bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-2">
                      {durationInDays} JOURS SÉLECTIONNÉS
                    </span>
                    <span className="text-4xl font-black text-brand-dark tracking-tighter">Total: {totalPrice}$</span>
                    {savings > 0 && (
                      <span className="text-sm font-bold text-green-600 mt-1 uppercase tracking-wider">
                        Économie de {savings}$ incluse
                      </span>
                    )}
                  </div>
                ) : (
                  product.stock_level !== undefined && product.stock_level > 0 && (
                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest text-green-700">En Stock</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Pricing Coefficients Table */}
            <div className="mb-10 pt-8 border-t border-brand-border/30">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Tarification Dégressive</h4>
              <div className="grid grid-cols-4 gap-4">
                {RENTAL_COEFFICIENTS.map((coeff, idx) => {
                  const isActive = isDateSet && durationInDays >= coeff.from && durationInDays <= coeff.to;
                  return (
                    <div 
                      key={idx} 
                      className={`relative flex flex-col p-4 rounded-2xl border transition-all duration-300 ${
                        isActive 
                        ? 'bg-brand-dark border-brand-dark shadow-xl scale-105' 
                        : 'bg-white border-brand-border/50 opacity-60'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase mb-1 ${isActive ? 'text-brand-orange' : 'text-gray-400'}`}>
                        {coeff.from === coeff.to ? `${coeff.from} jour` : `${coeff.from}-${coeff.to} jrs`}
                      </span>
                      <span className={`text-lg font-black ${isActive ? 'text-white' : 'text-brand-dark'}`}>
                        {coeff.factor}x
                      </span>
                      {isActive && (
                        <div className="absolute -top-2 -right-2 bg-brand-orange text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {!isDateSet && (
              <div className="p-5 bg-brand-peach/20 rounded-2xl mb-8 flex items-center gap-4 border border-brand-peach/30">
                <div className="w-10 h-10 rounded-full bg-brand-peach flex items-center justify-center text-brand-gold shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-brand-gold leading-tight uppercase tracking-tight">Sélectionnez vos dates pour débloquer les tarifs dégressifs.</p>
              </div>
            )}

            {isDateSet && product.stock_level !== undefined && product.stock_level <= 0 && (
              <div className="p-4 bg-red-50 rounded-xl mb-8 flex items-center gap-3 border border-red-100">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-red-600">Ce produit est indisponible pour les dates sélectionnées.</p>
              </div>
            )}

            <button 
              onClick={handleAddToCart}
              disabled={isDateSet && product.stock_level !== undefined && product.stock_level <= 0}
              className={`w-full py-5 text-lg shadow-xl flex items-center justify-center gap-3 transition-all duration-300 ${
                added 
                  ? 'bg-green-500 text-white shadow-green-200 rounded-2xl' 
                  : isDateSet && product.stock_level !== undefined && product.stock_level <= 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed rounded-2xl'
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
              {added ? 'Ajouté !' : isDateSet && product.stock_level !== undefined && product.stock_level <= 0 ? 'Indisponible' : 'Ajouter à la soumission'}
            </button>
          </div>


          {product.specifications && (
            <div className="mt-12 pt-12 border-t border-brand-border/30">
              <h3 className="text-lg font-bold uppercase tracking-widest mb-6">Informations Supplémentaires</h3>
              <div 
                className="prose-brand text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatDescription(product.specifications) }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Accessories Section: Spans full width at the bottom */}
      {product.accessories && product.accessories.length > 0 && (
        <div className="mt-32 border-t border-brand-border pt-20">
          <h2 className="text-3xl font-bold text-center mb-16 uppercase tracking-[0.2em]">Accessoires</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {product.accessories.map((accessory) => (
              <div key={accessory.id} className="flex flex-col">
                <Link href={`/products/${accessory.id}`} className="group">
                  <div className="aspect-square bg-brand-surface rounded-2xl overflow-hidden border border-brand-border mb-4 flex items-center justify-center p-6 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                    {accessory.image ? (
                      <img src={accessory.image} alt={accessory.name} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <div className="text-brand-gold/20 italic text-xs">Pas d'image</div>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-brand-gold transition-colors">{accessory.name}</h4>
                  <p className="text-sm font-black text-gray-900">
                    CAD ${accessory.price.toFixed(2)}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
