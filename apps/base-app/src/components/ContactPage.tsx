"use client";

import { motion } from "framer-motion";
import { Button } from "@repo/ui/button";
import { MapPin, Mail, Send, ArrowRight } from "lucide-react";

const offices = [
  {
    city: "Saint-Marc-des-Carrières",
    address: "277 Boul. Bona-Dussault, Saint-Marc-des-Carrières, QC G0A 4B0",
    mapLink: "https://maps.app.goo.gl/fsN332s9G7LvZrTYA",
  },
  {
    city: "Québec",
    address: "31, rue des Jardins, Québec, Qc",
    mapLink: "https://maps.app.goo.gl/T9yyCVWw5B9QT8JbA",
  },
];

export default function ContactPage() {
  return (
    <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 pt-20 pb-6">
      {/* Header Section - More Compact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-charcoal mb-2">
          Entrez en <span className="text-brand-gold italic">Contact</span>
        </h1>
        <div className="brand-line w-20" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Offices Column */}
        <div className="lg:col-span-5 space-y-4">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] uppercase tracking-widest text-gray-400 font-bold"
          >
            Nos Bureaux
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {offices.map((office, index) => (
              <motion.div
                key={office.city}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-brand-cream-dark rounded-lg flex items-center justify-center text-brand-gold">
                  <MapPin size={16} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-brand-charcoal">
                    {office.city}
                  </h3>
                  <p className="text-gray-500 text-xs leading-snug mb-2">
                    {office.address}
                  </p>
                  <a 
                    href={office.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-brand-gold font-bold text-[10px] uppercase tracking-wider hover:text-brand-orange transition-colors"
                  >
                    Carte <ArrowRight size={12} className="ml-1" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section - Combined Column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-7 relative overflow-hidden bg-brand-charcoal rounded-3xl p-8 flex flex-col justify-between h-full min-h-[300px]"
        >
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold opacity-10 blur-3xl -mr-16 -mt-16" />

          <div className="relative z-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
              Besoin de nous écrire ?
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-md">
              Remplissez notre formulaire pour une demande d’information ou de soumission.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              <Button size="sm" className="px-5 py-2">
                Démarrer Votre Projet
              </Button>
              <Button variant="outline" size="sm" className="border-gray-700 text-white hover:bg-gray-800 px-5 py-2">
                <Mail size={16} className="mr-2" />
                Nous écrire
              </Button>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-brand-gold font-bold uppercase tracking-widest text-[9px] mb-1">Infolettre</p>
                <h4 className="text-white text-sm font-bold">Restons connectés</h4>
              </div>
              <div className="flex p-1 bg-gray-900 rounded-full border border-gray-700 focus-within:border-brand-gold transition-colors w-full sm:w-auto min-w-[240px]">
                <input 
                  type="email" 
                  placeholder="votre@courriel.com" 
                  className="bg-transparent border-none focus:ring-0 text-white px-4 py-1.5 w-full text-xs"
                />
                <button className="bg-brand-gold text-brand-charcoal p-2 rounded-full hover:bg-brand-accent transition-colors">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
