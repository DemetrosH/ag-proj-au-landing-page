'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Navigation",
      links: [
        { label: "Accueil", href: "/" },
        { label: "Inventaire", href: "/categories" },
        { label: "Contact", href: "/contact" },
        { label: "Ma Soumission", href: "/soumission" }
      ]
    },
    {
      title: "Catégories",
      links: [
        { label: "Alimentaire", href: "/categories/alimentaire" },
        { label: "Sonorisation", href: "/categories/sonorisation" },
        { label: "Éclairage", href: "/categories/eclairage" },
        { label: "Enseigne Néon", href: "/categories/enseigne-neon" },
        { label: "Mobilier", href: "/categories/ameublements" }
      ]
    }
  ];

  return (
    <footer className="bg-brand-dark text-white pt-24 pb-12 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-orange via-brand-gold to-brand-orange opacity-50" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-orange/5 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-8 group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 border-2 border-brand-orange transform group-hover:rotate-6 transition-transform">
                  <img src="/logo2-A.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter leading-none">ARTÉFACT</span>
                  <span className="text-xs font-bold tracking-[0.3em] text-brand-orange">LOCATION</span>
                </div>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
              Votre partenaire technique pour tous vos besoins en location d'équipement événementiel au Québec. Expertise, qualité et service exceptionnel.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Facebook size={18} />, href: "#" },
                { icon: <Instagram size={18} />, href: "#" },
                { icon: <Linkedin size={18} />, href: "#" }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ y: -3, backgroundColor: '#F7A831' }}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-colors"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, idx) => (
            <div key={idx} className="lg:col-span-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-8">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest flex items-center group"
                    >
                      <ArrowRight size={14} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-brand-orange" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div className="lg:col-span-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-8">
              Contact
            </h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-brand-orange" />
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  825 Boulevard Lebourgneuf, <br />
                  Québec, QC G2J 0B9
                </div>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-brand-orange" />
                </div>
                <a href="tel:+14180000000" className="text-sm text-gray-400 font-bold hover:text-white transition-colors">
                  (418) 000-0000
                </a>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-brand-orange" />
                </div>
                <a href="mailto:info@artefacturbain.ca" className="text-sm text-gray-400 font-bold hover:text-white transition-colors">
                  info@artefacturbain.ca
                </a>
              </li>
            </ul>
            <div className="mt-8">
               <Link 
                href="https://artefacturbain.ca" 
                target="_blank"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
              >
                Visiter artefacturbain.ca <ExternalLink size={12} />
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            © {currentYear} Artéfact Urbain. Tous droits réservés.
          </div>
          <div className="flex gap-8 uppercase tracking-[0.2em] text-[10px] font-bold text-gray-500">
            <Link href="#" className="hover:text-brand-orange transition-colors">Confidentialité</Link>
            <Link href="#" className="hover:text-brand-orange transition-colors">Conditions</Link>
            <Link href="#" className="hover:text-brand-orange transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
