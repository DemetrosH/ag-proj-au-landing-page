'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { createClient } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Play, Shield, Users, Mail, AlertTriangle, CheckCircle, Database } from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Tools states
  const [syncing, setSyncing] = useState<string | null>(null); // 'smart', 'full', 'email'
  const [actionResult, setActionResult] = useState<any>(null);
  
  // Logs states
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // Users states
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          setIsAdmin(true);
          // Load data in parallel
          fetchLogs();
          fetchProfiles();
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch sync logs
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Fetch user profiles
  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('email', { ascending: true });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  // Trigger sync / email endpoints
  const triggerEndpoint = async (type: 'smart' | 'full' | 'email') => {
    setSyncing(type);
    setActionResult(null);
    try {
      let url = '/location/api/sync';
      if (type === 'full') {
        url = '/location/api/sync?full=true';
      } else if (type === 'email') {
        url = '/location/api/test-email';
      }

      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        setActionResult({
          success: true,
          message: data.message || 'Opération réussie',
          details: data
        });
        // Auto refresh logs after sync
        if (type !== 'email') {
          fetchLogs();
        }
      } else {
        throw new Error(data.message || data.error || 'Erreur lors de l\'exécution');
      }
    } catch (err: any) {
      setActionResult({
        success: false,
        message: err.message || 'Une erreur inattendue est survenue'
      });
    } finally {
      setSyncing(null);
    }
  };

  // Toggle user role (Admin <-> Guest)
  const toggleUserRole = async (targetProfile: any) => {
    const newRole = targetProfile.role === 'admin' ? 'guest' : 'admin';
    
    // Prevent self-demotion
    if (targetProfile.id === user?.id) {
      alert('Vous ne pouvez pas retirer votre propre rôle administrateur.');
      return;
    }

    const confirmMsg = `Voulez-vous vraiment changer le rôle de ${targetProfile.email} à ${newRole.toUpperCase()} ?`;
    if (!window.confirm(confirmMsg)) return;

    setUpdatingUser(targetProfile.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetProfile.id);

      if (error) throw error;
      
      // Update local state
      setProfiles(prev =>
        prev.map(p => p.id === targetProfile.id ? { ...p, role: newRole } : p)
      );
    } catch (err: any) {
      alert(`Erreur lors du changement de rôle: ${err.message}`);
    } finally {
      setUpdatingUser(null);
    }
  };

  // Filter profiles based on search query
  const filteredProfiles = profiles.filter(p => 
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date helper
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // 1. Loading state (Authenticating)
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-orange"></div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Vérification des accès...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // 2. Access denied state (Not Admin)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8 border border-red-100 shadow-xl shadow-red-500/5">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tighter mb-4">
            Accès <span className="text-red-500">Refusé</span>
          </h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest max-w-md leading-relaxed mb-10">
            Vous ne possédez pas les autorisations nécessaires pour accéder à l'espace administration.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-brand-dark text-white font-black uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-brand-orange transition-all shadow-xl shadow-brand-dark/10 text-xs"
          >
            Retour à l'accueil
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // 3. Admin dashboard view
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Page Title & Hero */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em] block mb-2">Espace Pro</span>
            <h1 className="text-5xl font-black text-brand-dark uppercase tracking-tighter">
              Panneau d'<span className="text-brand-orange">Administration</span>
            </h1>
            <p className="text-sm text-gray-400 font-semibold uppercase tracking-widest mt-2">
              Synchronisation des données Rentman et gestion des rôles de l'équipe
            </p>
          </div>
          <div className="flex items-center bg-brand-surface border border-brand-border px-5 py-2.5 rounded-full text-xs font-bold text-gray-500">
            <Shield className="w-4 h-4 text-brand-orange mr-2" />
            <span>Connecté en tant qu'administrateur</span>
          </div>
        </div>

        {/* Action Results Banner */}
        <AnimatePresence>
          {actionResult && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-12 p-6 rounded-[2rem] border relative overflow-hidden flex items-start gap-4 ${
                actionResult.success 
                  ? 'bg-green-50/50 border-green-200 text-green-800' 
                  : 'bg-red-50/50 border-red-200 text-red-800'
              }`}
            >
              <div className="mt-1">
                {actionResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-black uppercase tracking-wider mb-2">
                  {actionResult.success ? 'Opération réussie' : 'Échec de l\'opération'}
                </h4>
                <p className="text-xs font-semibold leading-relaxed mb-3">{actionResult.message}</p>
                
                {actionResult.success && actionResult.details && (
                  <div className="bg-white/80 border border-green-100 rounded-xl p-4 text-[11px] font-mono space-y-1 text-green-700">
                    <div>Jeton : {actionResult.details.count ?? '-'} éléments mis à jour</div>
                    <div>Durée : {actionResult.details.duration ?? '-'}</div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setActionResult(null)}
                className="text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100"
              >
                Fermer
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LEFT & CENTER: Sync Tools & Logs */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Tool Grid */}
            <div className="bg-brand-surface border border-brand-border rounded-[3rem] p-8 md:p-10 relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-8 flex items-center gap-3">
                <Database className="w-6 h-6 text-brand-orange" />
                Outils de Synchronisation
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tool Card 1: Smart Sync */}
                <div className="bg-white border border-brand-border rounded-[2rem] p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-brand-dark mb-2">Smart Sync</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-6">
                      Synchronise uniquement les équipements créés ou modifiés récemment. Rapide et optimisé.
                    </p>
                  </div>
                  <button
                    disabled={syncing !== null}
                    onClick={() => triggerEndpoint('smart')}
                    className="w-full bg-brand-dark text-white font-black uppercase tracking-wider text-[10px] py-3 rounded-full hover:bg-brand-orange transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {syncing === 'smart' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3 fill-white" />
                    )}
                    <span>{syncing === 'smart' ? 'En cours...' : 'Lancer'}</span>
                  </button>
                </div>

                {/* Tool Card 2: Full Sync */}
                <div className="bg-white border border-brand-border rounded-[2rem] p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-brand-dark mb-2">Forcer Full Sync</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-6">
                      Bypasse le cache et force un rechargement complet de tout le catalogue Rentman. Plus long.
                    </p>
                  </div>
                  <button
                    disabled={syncing !== null}
                    onClick={() => triggerEndpoint('full')}
                    className="w-full bg-white border border-brand-border text-brand-dark font-black uppercase tracking-wider text-[10px] py-3 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {syncing === 'full' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>{syncing === 'full' ? 'En cours...' : 'Forcer'}</span>
                  </button>
                </div>

                {/* Tool Card 3: Test Email */}
                <div className="bg-white border border-brand-border rounded-[2rem] p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-brand-dark mb-2">Test E-mail</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-6">
                      Envoie un email de test pour valider la configuration et la clé d'API de la passerelle Resend.
                    </p>
                  </div>
                  <button
                    disabled={syncing !== null}
                    onClick={() => triggerEndpoint('email')}
                    className="w-full bg-white border border-brand-border text-brand-dark font-black uppercase tracking-wider text-[10px] py-3 rounded-full hover:bg-brand-surface transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {syncing === 'email' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mail className="w-3.5 h-3.5" />
                    )}
                    <span>{syncing === 'email' ? 'Envoi...' : 'Tester email'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sync Logs */}
            <div className="bg-white border border-brand-border rounded-[3rem] p-8 md:p-10 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight flex items-center gap-3">
                  <Database className="w-6 h-6 text-brand-orange" />
                  Journal de Synchronisation
                </h2>
                <button
                  onClick={fetchLogs}
                  disabled={loadingLogs}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange hover:text-brand-dark transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Rafraîchir</span>
                </button>
              </div>

              {loadingLogs && logs.length === 0 ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-orange"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-brand-border rounded-2xl bg-brand-surface">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Aucun journal disponible.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-brand-border">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-brand-surface border-b border-brand-border">
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-gray-400">Date (Montréal)</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-gray-400">Source</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-gray-400">Statut</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-gray-400 text-center">Éléments</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-gray-400 text-center">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {logs.map((log) => {
                        const statusColor = 
                          log.status === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 
                          log.status === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 
                          'bg-amber-50 text-amber-600 border-amber-100';
                        
                        return (
                          <tr key={log.id} className="hover:bg-brand-surface/20 transition-colors text-xs">
                            <td className="p-4 font-semibold text-brand-dark whitespace-nowrap">
                              {formatDateTime(log.created_at)}
                            </td>
                            <td className="p-4 font-black uppercase tracking-wider text-gray-400 whitespace-nowrap">
                              {log.source}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${statusColor}`}>
                                {log.status}
                              </span>
                              {log.error_message && (
                                <p className="text-[10px] text-red-500 mt-1 max-w-[200px] truncate" title={log.error_message}>
                                  {log.error_message}
                                </p>
                              )}
                            </td>
                            <td className="p-4 text-center font-bold text-brand-dark">
                              {log.items_processed ?? '-'}
                            </td>
                            <td className="p-4 text-center font-semibold text-brand-dark">
                              {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(2)}s` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: User Management */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-brand-border rounded-[3rem] p-8 md:p-10 shadow-sm sticky top-32">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight flex items-center gap-3">
                  <Users className="w-6 h-6 text-brand-orange" />
                  Rôles Équipe
                </h2>
                <button
                  onClick={fetchProfiles}
                  disabled={loadingProfiles}
                  className="text-gray-400 hover:text-brand-orange transition-colors disabled:opacity-50"
                  title="Rafraîchir les utilisateurs"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingProfiles ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed mb-6">
                Consultez l'équipe enregistrée et promouvez des comptes au rôle d'administrateur.
              </p>

              {/* Search user */}
              <input
                type="text"
                placeholder="Filtrer par adresse courriel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2 px-4 text-xs font-semibold focus:outline-none focus:border-brand-orange mb-6"
              />

              {loadingProfiles && profiles.length === 0 ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-brand-orange"></div>
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-brand-border rounded-xl bg-brand-surface text-xs text-gray-400">
                  Aucun membre trouvé
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-100">
                  {filteredProfiles.map((p) => {
                    const isSelf = p.id === user?.id;
                    const isAdminUser = p.role === 'admin';
                    
                    return (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-brand-surface rounded-2xl border border-brand-border hover:border-gray-300 transition-all">
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-bold text-brand-dark truncate" title={p.email}>
                            {p.email}
                          </p>
                          <span className={`inline-block mt-1 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                            isAdminUser 
                              ? 'bg-orange-50 text-brand-orange border-orange-100' 
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}>
                            {p.role || 'guest'}
                          </span>
                          {isSelf && (
                            <span className="ml-1.5 text-[8px] font-bold text-gray-300 uppercase tracking-widest">(Vous)</span>
                          )}
                        </div>
                        
                        <button
                          disabled={updatingUser === p.id || isSelf}
                          onClick={() => toggleUserRole(p)}
                          className={`text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all ${
                            isSelf 
                              ? 'opacity-40 cursor-not-allowed text-gray-400 border-gray-200 bg-white'
                              : isAdminUser
                                ? 'bg-white hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-brand-dark border-brand-border'
                                : 'bg-brand-dark hover:bg-brand-orange hover:border-brand-orange text-white border-brand-dark'
                          }`}
                        >
                          {updatingUser === p.id 
                            ? '...' 
                            : isAdminUser 
                              ? 'Retirer admin' 
                              : 'Rendre admin'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
