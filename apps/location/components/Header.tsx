'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRental } from '../context/RentalContext';
import { useCart } from '../context/CartContext';
// Import WooCommerce mapping data
import wcData from '../data/wc-data.json';
import { createClient } from '../lib/supabase/client';
import { URBA_ACCESS_RULES, UserRole } from '../lib/access-control';

export function Header() {
  const { startDate, endDate, setDates, isDateSet } = useRental();
  const { itemCount } = useCart();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUser({ ...user, role: profile?.role || 'guest' });
      } else {
        setUser(null);
      }
    };
    fetchUserAndRole();
  }, []);

  useEffect(() => {
    const role: UserRole = user?.role || 'guest';
    const rules = URBA_ACCESS_RULES[role];
    
    // Filter and format categories from sync data
    const activeCategories = wcData.categories
      .filter(cat => cat.name !== 'Uncategorized' && cat.name !== 'Populaire' && cat.name !== 'Produits vedette')
      .filter(cat => !rules.hideCats.includes(cat.slug))
      .map(cat => ({
        ...cat,
        name: cat.name.replace('&amp;', '&')
      }));
    setCategories(activeCategories);
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  // Search logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setIsSearchOpen(false);
        return;
      }

      setIsSearching(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, rentman_id, name, image_url, price, category_slug')
        .ilike('name', `%${searchQuery}%`)
        .limit(6);

      if (!error && data) {
        setSearchResults(data);
        setIsSearchOpen(true);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const formatDate = (dateStr: string) => {
    // Add T00:00:00 to force local timezone parsing
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }).toUpperCase();
  };

  const formatCompactDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  // Date constraint logic
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getFormattedDateStr = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const tomorrowStr = getTomorrowStr();

  // If start date exists, max end date is start date + 6 days
  let maxEndDateStr = '';
  if (startDate) {
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + 6);
    maxEndDateStr = getFormattedDateStr(d) || '';
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newStart = e.target.value;
    if (!newStart || (tomorrowStr && newStart < tomorrowStr)) {
      newStart = tomorrowStr || '';
    }
    
    // Check if current end date is now invalid
    let newEnd = endDate;
    if (newEnd) {
      const s = new Date(newStart);
      const eDate = new Date(newEnd);
      const maxE = new Date(s);
      maxE.setDate(maxE.getDate() + 6);

      if (eDate < s || eDate > maxE) {
        newEnd = newStart; // Reset end date to start date if out of bounds
      }
    }
    setDates(newStart, newEnd);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newEnd = e.target.value;
    const minEnd = startDate || tomorrowStr || '';
    
    if (newEnd < minEnd) {
      newEnd = minEnd;
    } else if (maxEndDateStr && newEnd > maxEndDateStr) {
      newEnd = maxEndDateStr;
    }
    
    setDates(startDate, newEnd);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-white/90 backdrop-blur-md">
      <div className="container mx-auto px-4">
        {/* Top Header: Logo, Search, Account/Cart */}
        <div className="h-20 flex items-center justify-between gap-1 sm:gap-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              <span className="text-[#E7A128]">Artéfact</span> <span className="hidden sm:inline">Urbain</span>
              <span className="hidden sm:inline-block ml-2 text-sm font-medium uppercase tracking-widest text-gray-400">Location</span>
            </span>
          </Link>

          <div 
            className="hidden xl:flex flex-grow max-w-xl relative"
            onMouseEnter={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
            onMouseLeave={() => setIsSearchOpen(false)}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
              placeholder="Rechercher un équipement..."
              className="w-full bg-brand-surface border border-brand-border rounded-full py-2.5 px-6 pr-12 text-sm focus:outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/5 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSearchOpen(false);
                  }}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>

            {/* Desktop Search Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-brand-border shadow-2xl rounded-2xl z-50 before:absolute before:inset-x-0 before:-top-4 before:h-4 before:bg-transparent">
                <div className="max-h-[400px] overflow-y-auto rounded-2xl overflow-hidden">
                  {searchResults.map((result) => (
                    <Link
                      key={result.rentman_id || result.id}
                      href={`/products/${result.rentman_id || result.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-brand-surface transition-colors border-b border-brand-border last:border-0"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-brand-border">
                        {result.image_url ? (
                          <img src={result.image_url} alt={result.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300 italic">No img</div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-gray-900">{result.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{result.price}$ / jour</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="p-3 bg-brand-surface text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Appuyez sur entrée pour voir tous les résultats</p>
                </div>
              </div>
            )}
            
            {isSearchOpen && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-brand-border shadow-2xl rounded-2xl p-6 text-center z-50 before:absolute before:inset-x-0 before:-top-4 before:h-4 before:bg-transparent">
                <p className="text-sm text-gray-500">Aucun produit trouvé pour "{searchQuery}"</p>
              </div>
            )}
          </div>

          {/* Account & Cart */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Date Selector Trigger */}
            <button 
              onClick={() => {
                setIsDatePickerOpen(!isDatePickerOpen);
                if (!isDatePickerOpen) setIsMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-1 sm:space-x-2 py-2 rounded-full border transition-all ${
                isDateSet ? 'bg-brand-gold/10 border-brand-gold text-brand-gold' : 'border-brand-border text-gray-600 hover:border-brand-gold'
              } px-2 sm:px-4`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {isDateSet ? (
                  <>
                    <span className="sm:hidden">{formatCompactDate(startDate!)} - {formatCompactDate(endDate!)}</span>
                    <span className="hidden sm:inline">{formatDate(startDate!)} - {formatDate(endDate!)}</span>
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">Dates</span>
                    <span className="hidden sm:inline">Choisir Dates</span>
                  </>
                )}
              </span>
            </button>

            {user ? (
              <div className="hidden sm:block relative group">
                <button className="flex items-center space-x-2 text-sm font-bold text-brand-dark hover:text-brand-orange transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-brand-border shadow-2xl rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link 
                    href="/profile"
                    className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-dark hover:bg-brand-surface rounded-xl transition-colors block"
                  >
                    Mon Profil
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-brand-gold transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Connexion</span>
              </Link>
            )}
            
            <Link href="/soumission" className="relative group">
              <svg className="w-6 h-6 text-gray-600 group-hover:text-brand-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                if (!isMobileMenuOpen) setIsDatePickerOpen(false);
              }}
              className="lg:hidden p-2 text-gray-600 hover:text-brand-gold transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Header: Navigation - Desktop Only */}
        <div className="hidden lg:flex h-12 border-t border-brand-border items-center justify-center">
          <nav className="flex items-center h-full space-x-12 text-xs font-bold tracking-widest uppercase">
            <Link href="/" className="text-gray-900 hover:text-brand-gold transition-colors flex items-center h-full px-2">
              Accueil
            </Link>
            <div 
              className="relative group h-full flex items-center"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <Link href="/categories" className="text-gray-900 hover:text-brand-gold transition-colors flex items-center h-full px-2">
                Catégories
                <svg className={`ml-1 w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              
              {isCategoryOpen && (
                <div className="absolute top-full left-0 pt-4 w-[700px] max-w-[90vw] animate-fade-in-up z-50">
                  <div className="bg-white border border-brand-border shadow-2xl rounded-2xl p-8 relative before:absolute before:inset-x-0 before:-top-4 before:h-4 before:bg-transparent">
                    <div className="columns-2 gap-x-12">
                      {categories.map((cat) => (
                        <Link 
                          key={cat.id} 
                          href={`/categories/${cat.slug}`}
                          className="block break-inside-avoid mb-3 text-gray-600 hover:text-brand-gold text-[13px] font-semibold tracking-wide transition-colors leading-tight"
                          onClick={() => setIsCategoryOpen(false)}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                    <div className="pt-5 mt-3 border-t border-brand-border text-center">
                      <Link 
                        href="/categories" 
                        className="inline-block text-brand-gold text-xs font-bold uppercase tracking-widest hover:underline"
                        onClick={() => setIsCategoryOpen(false)}
                      >
                        Voir toutes les catégories →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Link href="/contact#address" className="text-gray-900 hover:text-brand-gold transition-colors flex items-center h-full px-2">
              Contact
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-brand-border shadow-2xl z-50 animate-fade-in-down max-h-[80vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-3 px-12 text-sm focus:outline-none focus:border-brand-gold"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>

              {/* Mobile Search Results */}
              {searchQuery.length >= 2 && (searchResults.length > 0 || isSearching) && (
                <div className="mt-2 bg-white border border-brand-border rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                  {searchResults.map((result) => (
                    <Link
                      key={result.rentman_id || result.id}
                      href={`/products/${result.rentman_id || result.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-brand-surface transition-colors border-b border-brand-border last:border-0"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-brand-border">
                        {result.image_url ? (
                          <img src={result.image_url} alt={result.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300 italic">No img</div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="text-xs font-bold text-gray-900">{result.name}</p>
                      </div>
                    </Link>
                  ))}
                  {isSearching && (
                    <div className="p-3 text-center text-xs text-gray-500">Recherche en cours...</div>
                  )}
                  {!isSearching && searchResults.length === 0 && (
                    <div className="p-3 text-center text-xs text-gray-500">Aucun résultat</div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Links */}
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-lg font-black uppercase tracking-tighter text-brand-dark"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                href="/categories" 
                className="text-lg font-black uppercase tracking-tighter text-brand-dark"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Catégories
              </Link>
              <Link 
                href="/contact" 
                className="text-lg font-black uppercase tracking-tighter text-brand-dark"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/soumission" 
                className="text-lg font-black uppercase tracking-tighter text-brand-orange"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Soumission
              </Link>
            </nav>

            <div className="pt-6 border-t border-brand-border">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Compte</p>
              {user ? (
                <div className="space-y-4">
                  <Link 
                    href="/profile" 
                    className="flex items-center space-x-3 text-brand-dark"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-lg font-black uppercase tracking-tighter">Mon Profil</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-lg font-black uppercase tracking-tighter">Déconnexion</span>
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="flex items-center space-x-3 text-brand-dark"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-lg font-black uppercase tracking-tighter">Connexion</span>
                </Link>
              )}
            </div>

            <div className="pt-6 border-t border-brand-border">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Populaire</p>
              <div className="grid grid-cols-2 gap-4">
                {categories.slice(0, 6).map((cat) => (
                  <Link 
                    key={cat.id} 
                    href={`/categories/${cat.slug}`}
                    className="text-xs font-bold text-gray-600 hover:text-brand-gold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline Date Picker Modal */}
      {isDatePickerOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-brand-border shadow-2xl animate-fade-in-down">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4 md:gap-8 max-w-4xl mx-auto">
              <div className="flex-grow">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Début de location</label>
                <input 
                  type="date" 
                  min={tomorrowStr}
                  value={startDate || ''} 
                  onChange={handleStartDateChange}
                  onKeyDown={(e) => e.preventDefault()}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  className="w-full border border-brand-border rounded-xl p-5 text-lg focus:border-brand-gold focus:ring-0 cursor-pointer bg-brand-surface"
                />
              </div>
              <div className="flex-grow">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Fin (Max 7 jours)</label>
                <input 
                  type="date" 
                  min={startDate || tomorrowStr}
                  max={maxEndDateStr || undefined}
                  value={endDate || ''} 
                  onChange={handleEndDateChange}
                  onKeyDown={(e) => e.preventDefault()}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  className="w-full border border-brand-border rounded-xl p-5 text-lg focus:border-brand-gold focus:ring-0 cursor-pointer bg-brand-surface"
                  disabled={!startDate}
                />
              </div>
              <button 
                onClick={() => setIsDatePickerOpen(false)}
                className="bg-brand-gold text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl hover:bg-brand-gold-hover transition-all disabled:opacity-50 mt-4 md:mt-0 shadow-lg shadow-brand-gold/20"
                disabled={!startDate || !endDate}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
