'use client';

import React from 'react';

export function ContactForm({ isGuest }: { isGuest: boolean }) {
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isGuest) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const err = await response.json();
        setError(err.error || 'Une erreur est survenue.');
      }
    } catch (err) {
      setError('Impossible d\'envoyer le message pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-[3rem] p-12 text-center border border-green-100 shadow-xl">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter mb-2">Message Envoyé !</h3>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Merci de nous avoir contactés. Nous vous répondrons sous peu.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-8 text-brand-orange font-black uppercase tracking-widest text-[10px] hover:underline"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Nom Complet</label>
          <input 
            name="name"
            type="text" 
            placeholder="Jean Tremblay"
            required
            disabled={isGuest || loading}
            className="w-full bg-white border border-brand-border rounded-full py-4 px-8 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Téléphone</label>
          <input 
            name="phone"
            type="tel" 
            placeholder="(514) 000-0000"
            disabled={isGuest || loading}
            className="w-full bg-white border border-brand-border rounded-full py-4 px-8 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all disabled:opacity-50"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Adresse Courriel</label>
        <input 
          name="email"
          type="email" 
          placeholder="jean@exemple.com"
          required
          disabled={isGuest || loading}
          className="w-full bg-white border border-brand-border rounded-full py-4 px-8 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-6">Message</label>
        <textarea 
          name="message"
          rows={5}
          placeholder="Comment pouvons-nous vous aider ?"
          required
          disabled={isGuest || loading}
          className="w-full bg-white border border-brand-border rounded-[2rem] py-6 px-8 text-sm font-medium focus:outline-none focus:border-brand-orange focus:ring-8 focus:ring-brand-orange/5 transition-all resize-none disabled:opacity-50"
        ></textarea>
      </div>

      {error && (
        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-6">{error}</p>
      )}

      <div className="pt-4">
        <button 
          type="submit"
          disabled={isGuest || loading}
          className="w-full bg-brand-dark text-white font-black uppercase tracking-[0.3em] py-6 rounded-full hover:bg-brand-orange transition-all shadow-xl flex items-center justify-center gap-4 group disabled:opacity-50"
        >
          {loading ? 'Envoi en cours...' : 'Envoyer le message'}
          {!loading && (
            <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
