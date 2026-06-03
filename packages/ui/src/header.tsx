"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./utils";
import { Menu, X, ChevronDown } from "lucide-react";

interface Division {
  _id: string;
  title: string;
  link: string;
}

interface HeaderProps {
  className?: string;
  divisions?: Division[];
}

// Sticky navigation header component with logo, navigation links, and dynamic divisions dropdown
export const Header = ({ className, divisions = [] }: HeaderProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const navLinks = [
    { name: "L'entreprise", href: "/entreprise" },
    { name: "Équipe", href: "/equipe" },
    { name: "Clients", href: "/clients" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className={cn("fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Placeholder */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="text-2xl font-display font-bold text-brand-charcoal">
              <span className="text-brand-gold">Artéfact</span> Urbain
            </a>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Dynamic Divisions Dropdown */}
            {divisions.length > 0 && (
              <div 
                className="relative group"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button 
                  className="flex items-center gap-1 text-sm font-medium text-brand-charcoal hover:text-brand-gold transition-colors py-8"
                >
                  Nos Domaines d'Expertise
                  <ChevronDown size={14} className={cn("transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-b-xl border-t-2 border-brand-gold py-4 overflow-hidden"
                    >
                      {divisions.map((division) => (
                        <a
                          key={division._id}
                          href={division.link}
                          className="block px-6 py-3 text-sm text-brand-charcoal hover:bg-brand-cream hover:text-brand-gold transition-colors font-medium"
                        >
                          {division.title}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-brand-charcoal hover:text-brand-gold transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-charcoal p-2 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Divisions */}
              {divisions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Nos Domaines d'Expertise</p>
                  {divisions.map((division) => (
                    <a
                      key={division._id}
                      href={division.link}
                      className="block text-lg font-medium text-brand-charcoal hover:text-brand-gold px-2 py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      {division.title}
                    </a>
                  ))}
                  <div className="border-t border-gray-100 my-4 pt-4" />
                </div>
              )}

              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-lg font-medium text-brand-charcoal hover:text-brand-gold px-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

