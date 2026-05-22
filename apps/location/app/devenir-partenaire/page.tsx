'use client';

import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Check, Send, Shield, Zap, TrendingUp, ArrowRight } from 'lucide-react';

export default function DevenirPartenaire() {
  notFound();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    message: '',
    website: '', // Honeypot field (hidden from users)
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check: If 'website' is filled, it's likely a bot
    if (formData.website) {
      console.warn('Bot detected via honeypot');
      setStatus('success'); // Silently fail but show success to the bot
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/location/api/partner-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', company: '', email: '', message: '', website: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const benefits = [
    {
      title: "Tarification Privilégiée",
      desc: "Accédez à nos tarifs de gros exclusifs aux professionnels de l'événementiel.",
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: "Inventaire complet",
      desc: "Visualisez l'équipement spécialisé non disponible au grand public.",
      icon: <Shield className="w-6 h-6" />
    },
    {
      title: "Gestion Prioritaire",
      desc: "Vos demandes de soumission sont traitées en priorité par notre équipe.",
      icon: <Zap className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-brand-surface opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <span className="text-brand-orange font-black uppercase tracking-[0.3em] text-[10px]">Partenariat Pro</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black text-brand-dark uppercase tracking-tighter mb-8 leading-[0.9]"
              >
                Élevez vos événements <br/>
                <span className="text-brand-orange">avec Artéfact Urbain</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-2xl mx-auto mb-12"
              >
                Nous collaborons avec les agences, planificateurs et entreprises pour offrir des solutions de location haut de gamme et personnalisées.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-24 border-y border-brand-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[2rem] bg-brand-surface border border-brand-border hover:shadow-xl transition-all group"
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-orange mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight mb-4">{benefit.title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
              
              <div className="lg:w-1/2">
                <h2 className="text-4xl font-black text-brand-dark uppercase tracking-tighter mb-6">
                  Demandez votre <span className="text-brand-orange">Accès Partenaire</span>
                </h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs leading-loose mb-10">
                  Remplissez le formulaire ci-dessous. Notre équipe analysera votre demande et vous contactera sous 24 à 48 heures pour activer votre compte professionnel.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3" strokeWidth={4} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-brand-dark">Validation rapide</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3" strokeWidth={4} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-brand-dark">Aucun frais d'inscription</span>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 w-full">
                <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-brand-border shadow-2xl shadow-brand-dark/5">
                  {status === 'success' ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 text-white">
                        <Check className="w-10 h-10" strokeWidth={3} />
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Demande Envoyée</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                        Merci ! Nous avons bien reçu votre demande. Un membre de notre équipe vous contactera très bientôt.
                      </p>
                      <button 
                        onClick={() => setStatus('idle')}
                        className="mt-10 text-brand-orange font-black uppercase tracking-[0.2em] text-[10px] hover:underline"
                      >
                        Envoyer une autre demande
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nom Complet</label>
                          <input
                            type="text"
                            required
                            placeholder="Jean Tremblay"
                            className="w-full bg-brand-surface border border-brand-border rounded-full py-4 px-6 text-sm focus:outline-none focus:border-brand-orange transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Compagnie</label>
                          <input
                            type="text"
                            required
                            placeholder="Agence Événementielle Inc."
                            className="w-full bg-brand-surface border border-brand-border rounded-full py-4 px-6 text-sm focus:outline-none focus:border-brand-orange transition-all"
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Courriel Professionnel</label>
                        <input
                          type="email"
                          required
                          placeholder="jean@compagnie.com"
                          className="w-full bg-brand-surface border border-brand-border rounded-full py-4 px-6 text-sm focus:outline-none focus:border-brand-orange transition-all"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Message (Projet ou Besoin)</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Parlez-nous brièvement de vos besoins..."
                          className="w-full bg-brand-surface border border-brand-border rounded-[2rem] py-4 px-6 text-sm focus:outline-none focus:border-brand-orange transition-all"
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />
                      </div>

                      {/* Honeypot Field - Hidden from humans */}
                      <div className="hidden">
                        <label>Website (Do not fill)</label>
                        <input 
                          type="text" 
                          name="website" 
                          tabIndex={-1} 
                          autoComplete="off"
                          value={formData.website}
                          onChange={(e) => setFormData({...formData, website: e.target.value})}
                        />
                      </div>

                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={status === 'loading'}
                        className="w-full bg-brand-dark text-white font-black uppercase tracking-[0.2em] py-5 rounded-full hover:bg-brand-orange transition-all shadow-xl shadow-brand-dark/10 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {status === 'loading' ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Demander mon accès</span>
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                      
                      {status === 'error' && (
                        <p className="text-[10px] font-bold text-red-500 uppercase text-center">
                          Une erreur est survenue. Veuillez réessayer.
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
