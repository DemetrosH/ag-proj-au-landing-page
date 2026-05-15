'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useRental } from '../../context/RentalContext';
import { Header } from '../../components/Header';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '../../lib/supabase/client';
import { Footer } from '../../components/Footer';

function SoumissionContent() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart, factor } = useCart();
  const { startDate, endDate, durationInDays, isDateSet } = useRental();
  const [step, setStep] = React.useState<'cart' | 'checkout'>('cart');
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [dateError, setDateError] = React.useState(false);
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  // Handle step from query param and scroll to top
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam === 'checkout' && isDateSet && items.length > 0) {
      setStep('checkout');
    } else {
      setStep('cart');
    }
    window.scrollTo(0, 0);
  }, [searchParams, isDateSet, items.length]); // Removed 'step' from dependencies to avoid infinite loop when setting it internally

  // Form State
  const [formData, setFormData] = React.useState({
    fullName: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    locationName: '',
    locationAddress: '',
    locationCity: '',
    locationPostalCode: '',
    locationId: '', // Added to track Rentman ID
    eventDetails: ''
  });

  const [deliveryMethod, setDeliveryMethod] = React.useState<'pickup' | 'delivery'>('pickup');
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      }
    };
    fetchUser();
  }, []);

  // Location Autocomplete
  React.useEffect(() => {
    const search = async () => {
      if (formData.locationName.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/rentman/search-locations?q=${encodeURIComponent(formData.locationName)}`);
        const json = await res.json();
        setSuggestions(json.data || []);
      } catch (err) {
        console.error('Search error:', err);
      }
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [formData.locationName]);

  const copyBillingAddress = () => {
    setFormData(prev => {
      // If there's a company name, use it. Otherwise, use a descriptive name or just the address.
      // We avoid using the person's name as a location name if possible.
      const suggestedLocationName = prev.companyName || prev.address || 'Adresse de facturation';
      
      return {
        ...prev,
        locationName: suggestedLocationName,
        locationAddress: prev.address,
        locationCity: prev.city,
        locationPostalCode: prev.postalCode,
        locationId: '' // Clear ID as this is a manual copy
      };
    });
  };

  const selectSuggestion = (s: any) => {
    setFormData(prev => ({
      ...prev,
      locationName: s.name,
      locationAddress: s.address,
      locationCity: s.city,
      locationPostalCode: s.postalCode,
      locationId: s.id // Store the Rentman ID
    }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
    if (items.length <= 1) setStep('cart');
  };

  const handleQuantity = (id: string, q: number) => {
    const item = items.find(i => i.id === id);
    if (item && item.stock_level !== undefined && q > item.stock_level) {
      // Don't allow increasing beyond stock
      return;
    }
    updateQuantity(id, q);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!isDateSet) {
      setDateError(true);
      setTimeout(() => setDateError(false), 2000);
      return;
    }

    setLoading(true);

    // 0. Final Stock Check
    const overbooked = items.filter(item => item.stock_level !== undefined && item.quantity > item.stock_level);
    if (overbooked.length > 0) {
      alert(`Certains articles ne sont plus disponibles en quantité suffisante : ${overbooked.map(i => i.name).join(', ')}`);
      setLoading(false);
      return;
    }

    // Prepare submission data
    const submissionData: any = {
      user_id: user.id,
      full_name: formData.fullName,
      company_name: formData.companyName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      postal_code: formData.postalCode,
      location_name: formData.locationName,
      location_address: formData.locationAddress,
      location_city: formData.locationCity,
      location_postal_code: formData.locationPostalCode,
      event_details: formData.eventDetails,
      items: items,
      total_price: finalTotal,
      start_date: startDate,
      end_date: endDate,
      // New metadata fields
      delivery_method: deliveryMethod,
      subtotal: subtotal,
      tps: tps,
      tvq: tvq
    };

    // 1. Create Rentman Project Request FIRST
    let rid: string | null = null;
    try {
      const nameParts = formData.fullName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const rentmanRes = await fetch('/api/rentman/create-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          companyName: formData.companyName,
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          locationName: formData.locationName,
          locationId: formData.locationId,
          locationAddress: formData.locationAddress,
          locationCity: formData.locationCity,
          locationPostalCode: formData.locationPostalCode,
          startDate,
          endDate,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          details: formData.eventDetails,
          deliveryMethod: deliveryMethod
        })
      });

      const rentmanResult = await rentmanRes.json();
      if (rentmanRes.ok && rentmanResult.requestId) {
        rid = String(rentmanResult.requestId);
        console.log('[Integration] Received Rentman ID:', rid);
      } else {
        console.warn('[Rentman] Failed to create project request.');
      }
    } catch (err) {
      console.error('[Rentman Integration Error]:', err);
    }

    // 2. Save to Supabase with the Rentman ID (if we got one)
    const finalSubmissionData = {
      ...submissionData,
      rentman_id: rid
    };

    let { error } = await supabase
      .from('soumissions')
      .insert(finalSubmissionData);

    // Fallback: If columns don't exist yet, insert into event_details as JSON string
    if (error && error.message?.includes('column')) {
      console.warn('[Supabase] Missing columns, falling back to event_details.');
      const fallbackData = { ...finalSubmissionData };
      delete fallbackData.delivery_method;
      delete fallbackData.subtotal;
      delete fallbackData.tps;
      delete fallbackData.tvq;
      delete fallbackData.rentman_id;
      
      fallbackData.event_details = `${formData.eventDetails}\n\n--- METADATA ---\n${JSON.stringify({
        delivery_method: deliveryMethod,
        subtotal,
        tps,
        tvq,
        rentman_id: rid
      })}`;

      const fallbackResult = await supabase
        .from('soumissions')
        .insert(fallbackData);
      error = fallbackResult.error;
    }

    if (error) {
      alert("Erreur lors de l'envoi : " + error.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    clearCart();
    setLoading(false);
  };

  const subtotal = totalPrice;
  const tps = Math.round(subtotal * 0.05 * 100) / 100;
  const tvq = Math.round(subtotal * 0.09975 * 100) / 100;
  const finalTotal = Math.round((subtotal + tps + tvq) * 100) / 100;

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-16 md:py-32 text-center">
          <div className="max-w-2xl mx-auto bg-brand-surface rounded-[2rem] md:rounded-[4rem] p-8 md:p-20 border border-brand-border shadow-2xl shadow-brand-dark/5">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-10 text-white shadow-xl shadow-green-500/20">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-5xl font-black text-brand-dark uppercase tracking-tighter mb-6">
              Merci pour votre <span className="text-brand-orange">Demande</span>
            </h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest leading-relaxed mb-12">
              Votre soumission a été reçue. Notre équipe l'analysera et vous contactera dans les plus brefs délais.
            </p>
            <div className="flex flex-col gap-4">
              <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/profile" className="bg-brand-dark text-white font-black uppercase tracking-[0.2em] px-10 py-5 rounded-full hover:bg-brand-orange transition-all shadow-xl block">
                  Suivre mes demandes
                </Link>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                <Link href="/" className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-brand-orange transition-colors">
                  Retour à l'accueil
                </Link>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16">

        {items.length === 0 ? (
          <div className="text-center py-32 bg-brand-surface rounded-[3rem] border border-brand-border">
            <h2 className="text-4xl font-black text-brand-dark uppercase tracking-tighter mb-4">Votre Panier est <span className="text-brand-orange">Vide</span></h2>
            <p className="text-sm text-gray-400 mb-10 font-bold uppercase tracking-widest">Ajoutez des articles pour commencer votre soumission.</p>
            <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/" className="bg-brand-dark text-white font-black uppercase tracking-[0.2em] px-10 py-5 rounded-full hover:bg-brand-orange transition-all shadow-xl shadow-brand-dark/10 inline-block">
                Parcourir l'équipement
              </Link>
            </motion.div>
          </div>
        ) : (
          <>
            {step === 'cart' ? (
              <div className="flex flex-col lg:flex-row gap-12">
                {/* Items List */}
                <div className="lg:w-2/3 space-y-6">
                  <div className="flex justify-between items-end mb-8">
                    <h2 className="text-4xl font-black text-brand-dark uppercase tracking-tighter">Votre <span className="text-brand-orange">Panier</span></h2>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{items.length} Articles</span>
                  </div>

                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 border border-brand-border rounded-[1.5rem] sm:rounded-[2.5rem] bg-white hover:shadow-xl transition-all group text-center sm:text-left">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-gold/20 flex-shrink-0 overflow-hidden relative">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                          ) : (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-grow w-full sm:w-auto">
                          <h3 className="text-base sm:text-lg font-black text-brand-dark uppercase tracking-tight">{item.name}</h3>
                          <p className="text-brand-orange font-black text-sm">{Math.round(item.price * factor)}$ <span className="text-[9px] font-bold text-gray-400 uppercase">/ total</span></p>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0 mt-2 sm:mt-0">
                          <div className="flex items-center border border-brand-border rounded-full px-4 py-1.5 bg-gray-50">
                            <button onClick={() => handleQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-brand-orange transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-8 text-center font-black text-brand-dark">{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantity(item.id, item.quantity + 1)} 
                              className={`p-1 transition-colors ${
                                item.stock_level !== undefined && item.quantity >= item.stock_level
                                  ? 'text-gray-200 cursor-not-allowed'
                                  : 'hover:text-brand-orange'
                              }`}
                              disabled={item.stock_level !== undefined && item.quantity >= item.stock_level}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          {item.stock_level !== undefined && item.quantity >= item.stock_level && (
                            <span className="text-[8px] font-black text-brand-orange uppercase tracking-tighter">Max atteint</span>
                          )}
                          <button onClick={() => handleRemove(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={clearCart}
                    className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-red-500 transition-colors pt-6 flex items-center gap-2 ml-4"
                  >
                    Vider le panier
                  </button>
                </div>

                {/* Summary */}
                <div className="lg:w-1/3">
                  <div className="bg-brand-surface rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-brand-border sticky top-32">
                    <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-8">Récapitulatif</h3>
                    
                    <div className="space-y-4 mb-8">
                      {/* Delivery Options */}
                      <div className="bg-white border border-brand-border rounded-2xl p-4 space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="delivery" 
                            checked={deliveryMethod === 'pickup'} 
                            onChange={() => setDeliveryMethod('pickup')}
                            className="w-4 h-4 text-brand-orange focus:ring-brand-orange border-gray-300"
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark group-hover:text-brand-orange transition-colors">Ramasser à l'entrepôt</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="delivery" 
                            checked={deliveryMethod === 'delivery'} 
                            onChange={() => setDeliveryMethod('delivery')}
                            className="w-4 h-4 text-brand-orange focus:ring-brand-orange border-gray-300"
                          />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark group-hover:text-brand-orange transition-colors">Livraison à votre évènement</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">(Prix sur appel)</span>
                          </div>
                        </label>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pt-4">
                        <span className="text-gray-400">Dates</span>
                        <span className="text-brand-orange bg-white px-3 py-1 rounded-full border border-brand-border">
                          {isDateSet ? `${startDate} - ${endDate}` : 'Non définies'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">Sous-total</span>
                        <span className="text-brand-dark">{subtotal}$</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">TPS (5%)</span>
                        <span className="text-brand-dark">{tps}$</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">TVQ (9.975%)</span>
                        <span className="text-brand-dark">{tvq}$</span>
                      </div>
                      <div className="pt-6 border-t border-brand-border flex justify-between items-end">
                        <span className="text-sm font-black text-brand-dark uppercase tracking-widest">Total estimé</span>
                        <span className="text-4xl font-black text-brand-orange">{finalTotal}$</span>
                      </div>
                    </div>

                    <motion.div
                      animate={dateError ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button 
                        onClick={() => {
                          if (!isDateSet) {
                            setDateError(true);
                            setTimeout(() => setDateError(false), 2000);
                          } else {
                            setStep('checkout');
                          }
                        }}
                        className={`w-full text-white font-black uppercase tracking-[0.3em] py-6 rounded-full transition-all shadow-xl flex items-center justify-center gap-4 group ${
                          !isDateSet && dateError ? 'bg-red-500 shadow-red-500/20' : 'bg-brand-dark hover:bg-brand-orange'
                        }`}
                      >
                        Continuer
                        <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </motion.div>

                    {(!isDateSet || dateError) && (
                      <p className={`text-[10px] font-black uppercase text-center mt-4 transition-all duration-300 ${
                        dateError ? 'text-red-500 scale-110' : 'text-brand-orange'
                      }`}>
                        {dateError ? 'Veuillez choisir vos dates en haut !' : 'Veuillez choisir vos dates pour continuer'}
                      </p>
                    )}

                    {/* Delivery Info Box */}
                    <div className="mt-8 p-6 bg-brand-surface border-l-4 border-brand-orange rounded-r-2xl">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                        Livraison et récupération gratuites dans les régions de <span className="text-brand-dark font-black">Portneuf</span> et de la <span className="text-brand-dark font-black">ville de Québec</span> pour toute location de <span className="text-brand-orange font-black text-xs">1 000 $ et plus</span> avant taxes. Service de livraison et de récupération offert en semaine seulement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <button 
                  onClick={() => setStep('cart')}
                  className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-brand-orange transition-colors mb-8 group"
                >
                  <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Retour au panier
                </button>

                <div className="bg-brand-surface rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-20 border border-brand-border shadow-2xl shadow-brand-dark/5 relative overflow-hidden">
                  {!user && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center p-8">
                      <div className="bg-white border border-brand-border rounded-[3rem] p-12 shadow-2xl text-center max-w-sm">
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Espace <span className="text-brand-orange">Partenaire</span></h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8 leading-relaxed">
                          Vous devez être connecté à votre compte professionnel pour finaliser cette soumission.
                        </p>
                        <div className="flex flex-col gap-4">
                          <Link 
                            href="/login" 
                            className="bg-brand-dark text-white font-black uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-brand-orange transition-all shadow-xl block"
                          >
                            Connexion Pro
                          </Link>
                          <Link 
                            href="/devenir-partenaire" 
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-brand-orange transition-colors"
                          >
                            Demander un accès
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-12 text-center">
                    <h2 className="text-3xl sm:text-5xl font-black text-brand-dark uppercase tracking-tighter mb-4">
                      Finaliser ma <span className="text-brand-orange">Soumission</span>
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] px-4">
                      Dernière étape ! Nous avons besoin de vos coordonnées.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Nom Complet (Contact Principal)</label>
                        <input 
                          type="text" 
                          placeholder="Jean Tremblay"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          disabled={!user || loading}
                          className="w-full bg-white border border-brand-border rounded-full py-4 sm:py-5 px-6 sm:px-10 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all disabled:opacity-50 scroll-mt-40"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Nom de l'entreprise (Optionnel)</label>
                        <input 
                          type="text" 
                          placeholder="Artéfact Urbain Inc."
                          value={formData.companyName}
                          onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                          disabled={!user || loading}
                          className="w-full bg-white border border-brand-border rounded-full py-4 sm:py-5 px-6 sm:px-10 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all disabled:opacity-50 scroll-mt-40"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Adresse Courriel</label>
                        <input 
                          type="email" 
                          placeholder="jean@exemple.com"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          disabled={!user || loading}
                          className="w-full bg-white border border-brand-border rounded-full py-4 sm:py-5 px-6 sm:px-10 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all disabled:opacity-50 scroll-mt-40"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Téléphone</label>
                        <input 
                          type="tel" 
                          placeholder="(514) 000-0000"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          disabled={!user || loading}
                          className="w-full bg-white border border-brand-border rounded-full py-4 sm:py-5 px-6 sm:px-10 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all disabled:opacity-50 scroll-mt-40"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Adresse de facturation (Rue et numéro)</label>
                      <input 
                        type="text" 
                        placeholder="1234 Rue Saint-Denis"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        disabled={!user || loading}
                        className="w-full bg-white border border-brand-border rounded-full py-5 px-10 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all disabled:opacity-50 scroll-mt-40"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Ville</label>
                        <input 
                          type="text" 
                          placeholder="Montréal"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          disabled={!user || loading}
                          className="w-full bg-white border border-brand-border rounded-full py-4 sm:py-5 px-6 sm:px-10 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all disabled:opacity-50 scroll-mt-40"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Code Postal</label>
                        <input 
                          type="text" 
                          placeholder="H2X 3K5"
                          required
                          value={formData.postalCode}
                          onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                          disabled={!user || loading}
                          className="w-full bg-white border border-brand-border rounded-full py-4 sm:py-5 px-6 sm:px-10 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all disabled:opacity-50 scroll-mt-40"
                        />
                      </div>
                    </div>

                    <div className="space-y-6 pt-10 border-t border-brand-border">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange ml-6">Lieu de l'événement</label>
                        <button 
                          type="button"
                          onClick={copyBillingAddress}
                          className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-brand-orange transition-colors flex items-center gap-2"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          Même que l'adresse de facturation
                        </button>
                      </div>

                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Nom du lieu (ex: Le Studio, Parc Lafontaine, Chez moi...)"
                          required
                          value={formData.locationName}
                          onFocus={() => setShowSuggestions(true)}
                          onChange={(e) => {
                            setFormData({...formData, locationName: e.target.value});
                            setShowSuggestions(true);
                          }}
                          disabled={!user || loading}
                          className="w-full bg-white border border-brand-border rounded-full py-5 px-10 text-sm font-bold focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all disabled:opacity-50 scroll-mt-40"
                        />
                        
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-brand-border rounded-3xl shadow-2xl z-30 overflow-hidden">
                            {suggestions.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => selectSuggestion(s)}
                                className="w-full text-left px-8 py-4 hover:bg-brand-surface border-b border-brand-border last:border-none transition-colors group"
                              >
                                <div className="text-sm font-black text-brand-dark uppercase tracking-tight group-hover:text-brand-orange">{s.name}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase">{s.address}, {s.city}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Adresse de livraison (Si différente)</label>
                        <input 
                          type="text" 
                          placeholder="Rue et numéro"
                          required
                          value={formData.locationAddress}
                          onChange={(e) => setFormData({...formData, locationAddress: e.target.value})}
                          disabled={!user || loading}
                          className="w-full bg-white border border-brand-border rounded-full py-4 sm:py-5 px-6 sm:px-10 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all disabled:opacity-50 scroll-mt-40"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Ville</label>
                          <input 
                            type="text" 
                            placeholder="Montréal"
                            required
                            value={formData.locationCity}
                            onChange={(e) => setFormData({...formData, locationCity: e.target.value})}
                            disabled={!user || loading}
                            className="w-full bg-white border border-brand-border rounded-full py-4 sm:py-5 px-6 sm:px-10 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all disabled:opacity-50 scroll-mt-40"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Code Postal</label>
                          <input 
                            type="text" 
                            placeholder="H2H 1V3"
                            required
                            value={formData.locationPostalCode}
                            onChange={(e) => setFormData({...formData, locationPostalCode: e.target.value})}
                            disabled={!user || loading}
                            className="w-full bg-white border border-brand-border rounded-full py-4 sm:py-5 px-6 sm:px-10 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all disabled:opacity-50 scroll-mt-40"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-brand-border">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Instructions de livraison ou besoins particuliers</label>
                      <textarea 
                        rows={3}
                        placeholder="Ex: Code de porte, étage, ascenseur..."
                        value={formData.eventDetails}
                        onChange={(e) => setFormData({...formData, eventDetails: e.target.value})}
                        disabled={!user || loading}
                        className="w-full bg-white border border-brand-border rounded-[2.5rem] py-6 px-10 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all resize-none disabled:opacity-50 scroll-mt-40"
                      ></textarea>
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit"
                        disabled={!user || loading}
                        className="w-full bg-brand-dark text-white font-black uppercase tracking-[0.4em] py-8 rounded-full hover:bg-brand-orange transition-all shadow-xl flex items-center justify-center gap-5 group disabled:opacity-50"
                      >
                        {loading ? 'Envoi en cours...' : 'Confirmer la demande'}
                        {!loading && (
                          <svg className="w-8 h-8 transform group-hover:translate-x-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function SoumissionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SoumissionContent />
    </Suspense>
  );
}
