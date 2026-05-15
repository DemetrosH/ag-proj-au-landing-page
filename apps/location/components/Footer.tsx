'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight
} from 'lucide-react';

// Custom SVG Icons for better compatibility
const IconFacebook = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const IconInstagram = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);

const IconLinkedin = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);

const IconMail = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
);

const IconPhone = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.81 12.81 0 0 0 .62 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.62A2 2 0 0 1 22 16.92z"/></svg>
);

const IconMapPin = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);

const IconExternalLink = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);

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
        { label: "Chapiteaux", href: "/categories/chapiteaux" },
        { label: "Ameublements", href: "/categories/ameublements" },
        { label: "Équipements électriques", href: "/categories/rallongesmultiprises" },
        { label: "Sonorisation", href: "/categories/sonorisation" },
        { label: "Enseigne Néon", href: "/categories/enseigne-neon" },
        { label: "Vidéo", href: "/categories/video" },
        { label: "Scène", href: "/categories/scene" },
        { label: "Éclairage", href: "/categories/eclairage" },
        { label: "Signalétique", href: "/categories/signaletique" },
        { label: "Jeux", href: "/categories/jeux" },
        { label: "Blocs d'alimentation & batteries", href: "/categories/bloc-dalimentation-batteries" },
        { label: "Poids & Supports", href: "/categories/poids-support" }
      ]
    }
  ];

  return (
    <footer className="bg-brand-dark text-white pt-24 pb-12 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-orange via-brand-gold to-brand-orange opacity-50" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-orange/5 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 max-w-7xl 3xl:max-w-[100rem] 4xl:max-w-[120rem] 5xl:max-w-[140rem] relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-8 group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 border-2 border-brand-orange transform group-hover:rotate-6 transition-transform">
                  <img src="/logo2-A.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl 5xl:text-5xl font-black tracking-tighter leading-none">ARTÉFACT</span>
                  <span className="text-xs 5xl:text-xl font-bold tracking-[0.3em] text-brand-orange">LOCATION</span>
                </div>
              </div>
            </Link>
            <p className="text-gray-400 text-sm 5xl:text-2xl leading-relaxed mb-8 max-w-xs 5xl:max-w-2xl">
              Votre partenaire technique pour tous vos besoins en location d'équipement événementiel au Québec. Expertise, qualité et service exceptionnel.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <IconFacebook size={18} />, href: "https://www.facebook.com/artefacturbain/" },
                { icon: <IconInstagram size={18} />, href: "https://www.instagram.com/artefact.urbain/" },
                { icon: <IconLinkedin size={18} />, href: "https://www.linkedin.com/company/artefacturbain/" }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
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
              <h4 className="text-[10px] 5xl:text-xl font-black uppercase tracking-[0.2em] text-brand-orange mb-8">
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
                  <IconMapPin size={16} className="text-brand-orange" />
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  277 Boul. Bona-Dussault, <br />
                  Saint-Marc-des-Carrières, <br />
                  QC G0A 4B0
                </div>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <IconMail size={16} className="text-brand-orange" />
                </div>
                <a href="mailto:location@artefacturbain.ca" className="text-sm text-gray-400 font-bold hover:text-white transition-colors">
                  location@artefacturbain.ca
                </a>
              </li>
            </ul>
            <div className="mt-8">
               <Link 
                href="https://artefacturbain.ca" 
                target="_blank"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
              >
                Visiter artefacturbain.ca <IconExternalLink size={12} />
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
            <Link href="/confidentialite" className="hover:text-brand-orange transition-colors">Confidentialité</Link>
            <Link href="/conditions" className="hover:text-brand-orange transition-colors">Conditions</Link>
            <Link href="/cookies" className="hover:text-brand-orange transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
