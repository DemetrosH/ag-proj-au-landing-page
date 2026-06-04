'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { createClient } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Play, 
  Shield, 
  Users, 
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  Database,
  Search,
  BarChart2,
  Calendar,
  FileText,
  ArrowRight,
  Settings,
  Info,
  ShoppingBag,
  Percent,
  DollarSign,
  CalendarDays,
  Eye,
  Check
} from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Dashboard tabs
  const [activeTab, setActiveTab] = useState<'sync' | 'queue' | 'clients' | 'inventory' | 'analytics'>('sync');

  // Tools & Logs states (Tab 1)
  const [syncing, setSyncing] = useState<string | null>(null); // 'smart', 'full', 'email'
  const [actionResult, setActionResult] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // Users states (Tab 3)
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Submissions states (Tab 2)
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [searchSubQuery, setSearchSubQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [retryingSubmissionId, setRetryingSubmissionId] = useState<string | null>(null);

  // Inventory states (Tab 4)
  const [invSearchQuery, setInvSearchQuery] = useState('');
  const [invStartDate, setInvStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [invEndDate, setInvEndDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [invResults, setInvResults] = useState<any[]>([]);
  const [loadingInv, setLoadingInv] = useState(false);

  // Analytics states (Tab 5)
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

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
          // Initial loads
          fetchLogs();
          fetchProfiles();
          fetchSubmissions();
          fetchAnalytics();
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
        .limit(15);

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

  // Fetch quote submissions
  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const res = await fetch('/location/api/admin/submissions');
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions || []);
      } else {
        throw new Error(data.error || 'Failed to fetch submissions');
      }
    } catch (err: any) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Fetch sales analytics
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch('/location/api/admin/analytics');
      const data = await res.json();
      if (res.ok) {
        setAnalyticsData(data);
      } else {
        throw new Error(data.error || 'Failed to fetch analytics');
      }
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoadingAnalytics(false);
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
        if (type !== 'email') {
          fetchLogs();
          fetchAnalytics(); // Refresh analytics as new sync might have items
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

  // Update user profile (role and discount factor)
  const handleUpdateProfile = async (targetProfile: any, role: string, discountFactor: number) => {
    // Prevent self-demotion
    if (targetProfile.id === user?.id && role !== 'admin') {
      alert('Vous ne pouvez pas retirer votre propre rôle administrateur.');
      return;
    }

    setUpdatingUser(targetProfile.id);
    try {
      const res = await fetch('/location/api/admin/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: targetProfile.id,
          targetEmail: targetProfile.email,
          newRole: role,
          discountFactor
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }
      
      // Update local state
      setProfiles(prev =>
        prev.map(p => p.id === targetProfile.id ? { ...p, role, discount_factor: discountFactor } : p)
      );
      
      // Refresh analytics in case of role change
      fetchAnalytics();
    } catch (err: any) {
      alert(`Erreur lors de la mise à jour : ${err.message}`);
    } finally {
      setUpdatingUser(null);
    }
  };

  // Retry failed Rentman project request push
  const handleRetryPush = async (subId: string) => {
    setRetryingSubmissionId(subId);
    try {
      const res = await fetch('/location/api/admin/retry-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: subId })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Soumission synchronisée avec succès !');
        fetchSubmissions();
        fetchAnalytics(); // Refresh analytics total
      } else {
        throw new Error(data.error || 'Erreur lors de la synchronisation');
      }
    } catch (err: any) {
      alert(`Échec : ${err.message}`);
    } finally {
      setRetryingSubmissionId(null);
    }
  };

  // Fetch Rentman Live stock & availability checker
  const handleInventorySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invSearchQuery.trim()) return;

    setLoadingInv(true);
    try {
      // 1. Fetch matching cached products from DB
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${invSearchQuery}%`)
        .limit(10);

      if (error) throw error;

      if (!dbProducts || dbProducts.length === 0) {
        setInvResults([]);
        setLoadingInv(false);
        return;
      }

      // 2. Query availability endpoint in parallel for each match
      const results = await Promise.all(
        dbProducts.map(async (prod) => {
          try {
            const queryParams = new URLSearchParams({ 
              id: String(prod.rentman_id || ''),
              start: String(invStartDate || ''),
              end: String(invEndDate || '')
            });
            const availRes = await fetch(`/location/api/rentman/availability?${queryParams.toString()}`);
            if (availRes.ok) {
              const data = await availRes.json();
              return {
                id: prod.rentman_id,
                name: prod.name,
                image: prod.image_url,
                category: prod.category_slug,
                total: data.total,
                peak_allocated: data.peak_allocated,
                available: data.available,
                status: data.status
              };
            }
          } catch (err) {
            console.error(`Avail fetch error for ${prod.name}:`, err);
          }
          return {
            id: prod.rentman_id,
            name: prod.name,
            image: prod.image_url,
            category: prod.category_slug,
            total: prod.stock_level ?? 0,
            peak_allocated: 0,
            available: prod.stock_level ?? 0,
            status: 'unknown'
          };
        })
      );

      setInvResults(results);
    } catch (err: any) {
      console.error(err);
      alert(`Erreur lors de la recherche d'inventaire : ${err.message}`);
    } finally {
      setLoadingInv(false);
    }
  };

  // Filter profiles based on search query
  const filteredProfiles = profiles.filter(p => 
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter submissions based on search query
  const filteredSubmissions = submissions.filter(s => 
    s.full_name?.toLowerCase().includes(searchSubQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchSubQuery.toLowerCase()) ||
    (s.company_name && s.company_name.toLowerCase().includes(searchSubQuery.toLowerCase()))
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
      hour12: true
    });
  };

  // Loader state
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

  // Access denied
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header Title section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em] block mb-2">Espace Pro</span>
            <h1 className="text-5xl font-black text-brand-dark uppercase tracking-tighter">
              Panneau d'<span className="text-brand-orange">Administration</span>
            </h1>
            <p className="text-sm text-gray-400 font-semibold uppercase tracking-widest mt-2">
              Gestion de l'inventaire Rentman, des soumissions clients et des analytics
            </p>
          </div>
          <div className="flex items-center bg-brand-surface border border-brand-border px-5 py-2.5 rounded-full text-xs font-bold text-gray-500">
            <Shield className="w-4 h-4 text-brand-orange mr-2" />
            <span>Mode Administrateur Actif</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-10 border-b border-brand-border scrollbar-hide">
          {[
            { id: 'sync', label: 'Journal & Sync', icon: Database },
            { id: 'queue', label: 'Files d\'attente', icon: FileText },
            { id: 'clients', label: 'Profils & Rabais', icon: Users },
            { id: 'inventory', label: 'Inventaire Live', icon: CalendarDays },
            { id: 'analytics', label: 'Statistiques', icon: BarChart2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'queue') fetchSubmissions();
                  if (tab.id === 'analytics') fetchAnalytics();
                  if (tab.id === 'clients') fetchProfiles();
                  if (tab.id === 'sync') fetchLogs();
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                  isActive 
                    ? 'bg-brand-dark text-white border-brand-dark shadow-lg shadow-brand-dark/10' 
                    : 'bg-brand-surface text-gray-500 border-brand-border hover:border-gray-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-orange' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="space-y-12">
          
          {/* TAB 1: SYNC & LOGS */}
          {activeTab === 'sync' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-in-up">
              <div className="lg:col-span-2 space-y-12">
                {/* Sync tools */}
                <div className="bg-brand-surface border border-brand-border rounded-[3rem] p-8 relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-8 flex items-center gap-3">
                    <Database className="w-6 h-6 text-brand-orange" />
                    Synchronisation Manuelle
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tool 1 */}
                    <div className="bg-white border border-brand-border rounded-[2.5rem] p-6 hover:shadow-xl transition-all flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-brand-dark mb-2">Smart Sync</h3>
                        <p className="text-[11px] text-gray-400 leading-relaxed mb-6">
                          Sync rapide : traite uniquement les équipements modifiés ou créés récemment.
                        </p>
                      </div>
                      <button
                        disabled={syncing !== null}
                        onClick={() => triggerEndpoint('smart')}
                        className="w-full bg-brand-dark text-white font-black uppercase tracking-wider text-[10px] py-3.5 rounded-full hover:bg-brand-orange transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {syncing === 'smart' ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3 fill-white" />
                        )}
                        <span>{syncing === 'smart' ? 'En cours...' : 'Smart Sync'}</span>
                      </button>
                    </div>

                    {/* Tool 2 */}
                    <div className="bg-white border border-brand-border rounded-[2.5rem] p-6 hover:shadow-xl transition-all flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-brand-dark mb-2">Full Sync</h3>
                        <p className="text-[11px] text-gray-400 leading-relaxed mb-6">
                          Bypasse le cache et force un rechargement complet du catalogue Rentman.
                        </p>
                      </div>
                      <button
                        disabled={syncing !== null}
                        onClick={() => triggerEndpoint('full')}
                        className="w-full bg-white border border-brand-border text-brand-dark font-black uppercase tracking-wider text-[10px] py-3.5 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {syncing === 'full' ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        <span>{syncing === 'full' ? 'En cours...' : 'Forcer'}</span>
                      </button>
                    </div>

                    {/* Tool 3 */}
                    <div className="bg-white border border-brand-border rounded-[2.5rem] p-6 hover:shadow-xl transition-all flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-brand-dark mb-2">Test E-mail</h3>
                        <p className="text-[11px] text-gray-400 leading-relaxed mb-6">
                          Valide la clé d'API Resend en envoyant un e-mail de test au format de la division.
                        </p>
                      </div>
                      <button
                        disabled={syncing !== null}
                        onClick={() => triggerEndpoint('email')}
                        className="w-full bg-white border border-brand-border text-brand-dark font-black uppercase tracking-wider text-[10px] py-3.5 rounded-full hover:bg-brand-surface transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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

                {/* Logs Table */}
                <div className="bg-white border border-brand-border rounded-[3rem] p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight flex items-center gap-3">
                      <Database className="w-6 h-6 text-brand-orange" />
                      Journal des Synchronisations
                    </h2>
                    <button
                      onClick={fetchLogs}
                      disabled={loadingLogs}
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange hover:text-brand-dark transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                      <span>Rafraîchir</span>
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

              {/* Status Alert Banner */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-brand-surface border border-brand-border rounded-[3rem] p-8">
                  <h3 className="text-lg font-black uppercase tracking-tight text-brand-dark mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-brand-orange" />
                    Instructions Sync
                  </h3>
                  <div className="text-xs text-gray-500 space-y-4 font-medium leading-relaxed">
                    <p>
                      La synchronisation des produits est automatisée via une tâche cron de fond. Vous pouvez forcer manuellement une exécution si des changements sur Rentman doivent s'appliquer instantanément.
                    </p>
                    <div className="p-4 bg-white border border-brand-border rounded-2xl">
                      <span className="text-[9px] font-black uppercase tracking-wider text-brand-orange block mb-1">Dernière mise à jour</span>
                      <p className="font-bold text-brand-dark">
                        {logs.length > 0 ? formatDateTime(logs[0].created_at) : 'Inconnue'}
                      </p>
                    </div>
                  </div>
                </div>

                {actionResult && (
                  <div className={`p-6 rounded-[2rem] border relative overflow-hidden ${
                    actionResult.success ? 'bg-green-50/50 border-green-200 text-green-800' : 'bg-red-50/50 border-red-200 text-red-800'
                  }`}>
                    <h4 className="text-xs font-black uppercase tracking-wider mb-2">
                      {actionResult.success ? 'Succès' : 'Échec'}
                    </h4>
                    <p className="text-xs font-semibold leading-relaxed">{actionResult.message}</p>
                    {actionResult.details && actionResult.details.count !== undefined && (
                      <div className="mt-3 text-[10px] font-mono">
                        {actionResult.details.count} éléments modifiés en {actionResult.details.duration}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SUBMISSIONS & QUEUE */}
          {activeTab === 'queue' && (
            <div className="bg-white border border-brand-border rounded-[3rem] p-8 md:p-10 shadow-sm animate-fade-in-up">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight flex items-center gap-3">
                    <FileText className="w-6 h-6 text-brand-orange" />
                    Queue des Soumissions & Rentman
                  </h2>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
                    Vérifiez l'intégration Rentman et relancez les poussées bloquées
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-grow md:flex-initial">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Rechercher un client..."
                      value={searchSubQuery}
                      onChange={(e) => setSearchSubQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-brand-surface border border-brand-border rounded-full text-xs font-semibold focus:outline-none focus:border-brand-orange w-full md:w-64"
                    />
                  </div>
                  <button
                    onClick={fetchSubmissions}
                    disabled={loadingSubmissions}
                    className="p-2 border border-brand-border bg-brand-surface rounded-full text-gray-500 hover:text-brand-orange transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingSubmissions ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {loadingSubmissions && submissions.length === 0 ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-orange"></div>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-brand-border rounded-[2rem] bg-brand-surface">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Aucune soumission trouvée.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-brand-border">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-brand-surface border-b border-brand-border">
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-gray-400">Date (Montréal)</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-gray-400">Client / Compagnie</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-gray-400 text-center">Items</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-gray-400 text-right">Montant</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-gray-400 text-center">Jeton Rentman</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-wider text-gray-400 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {filteredSubmissions.map((sub) => {
                        const hasId = !!sub.rentman_id;
                        const itemsCount = Array.isArray(sub.items) ? sub.items.length : 0;
                        const statusColor = 
                          sub.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                          sub.status === 'denied' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-amber-50 text-amber-700 border-amber-100';

                        return (
                          <tr key={sub.id} className="hover:bg-brand-surface/20 transition-colors text-xs">
                            <td className="p-4 font-semibold text-brand-dark whitespace-nowrap">
                              {formatDateTime(sub.created_at)}
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-brand-dark">{sub.full_name}</div>
                              <div className="text-[10px] text-gray-400 font-semibold">{sub.company_name || 'Particulier'}</div>
                              <div className="text-[10px] text-brand-orange mt-0.5">{sub.email}</div>
                            </td>
                            <td className="p-4 text-center font-bold text-brand-dark">{itemsCount}</td>
                            <td className="p-4 text-right font-black text-brand-dark whitespace-nowrap">{sub.total_price}$</td>
                            <td className="p-4 text-center whitespace-nowrap">
                              {hasId ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="bg-green-50 text-green-700 border border-green-100 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                                    Lié : ID {sub.rentman_id}
                                  </span>
                                  <span className={`border text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColor}`}>
                                    {sub.status || 'pending'}
                                  </span>
                                </div>
                              ) : (
                                <span className="bg-red-50 text-red-700 border border-red-100 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                                  Non synchronisé / Échec
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setSelectedSubmission(sub)}
                                  className="p-1.5 border border-brand-border bg-white text-gray-600 hover:text-brand-dark rounded-lg hover:shadow transition-all"
                                  title="Détails"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                
                                {!hasId && (
                                  <button
                                    onClick={() => handleRetryPush(sub.id)}
                                    disabled={retryingSubmissionId === sub.id}
                                    className="px-3 py-1.5 bg-brand-orange text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
                                  >
                                    {retryingSubmissionId === sub.id ? 'Sync...' : 'Pousser'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Submission details modal */}
              <AnimatePresence>
                {selectedSubmission && (
                  <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white border border-brand-border rounded-[3rem] p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative"
                    >
                      <button
                        onClick={() => setSelectedSubmission(null)}
                        className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark font-black uppercase tracking-widest text-[10px]"
                      >
                        Fermer ×
                      </button>

                      <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.25em] block mb-2">Détails de la soumission</span>
                      <h3 className="text-3xl font-black text-brand-dark uppercase tracking-tighter mb-6">
                        {selectedSubmission.full_name}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs font-semibold text-gray-500 border-b border-brand-border pb-6">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block mb-1">Coordonnées</span>
                          <div>Tél : <span className="text-brand-dark">{selectedSubmission.phone}</span></div>
                          <div>Email : <span className="text-brand-dark">{selectedSubmission.email}</span></div>
                          <div>Compagnie : <span className="text-brand-dark">{selectedSubmission.company_name || 'N/A'}</span></div>
                          <div>Date de création : <span className="text-brand-dark">{formatDateTime(selectedSubmission.created_at)}</span></div>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block mb-1">Événement & Logistique</span>
                          <div>Type : <span className="text-brand-dark uppercase">{selectedSubmission.delivery_method === 'delivery' ? 'Livraison' : 'Ramassage'}</span></div>
                          <div>Lieu : <span className="text-brand-dark">{selectedSubmission.location_name || 'Facturation'}</span></div>
                          <div>Adresse : <span className="text-brand-dark">{selectedSubmission.location_address}, {selectedSubmission.location_city} {selectedSubmission.location_postal_code}</span></div>
                          <div>Dates : <span className="text-brand-orange font-black">{selectedSubmission.start_date} au {selectedSubmission.end_date}</span></div>
                        </div>
                      </div>

                      {/* Items requested */}
                      <div className="space-y-4 mb-8">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Équipements demandés</h4>
                        <div className="space-y-2">
                          {(selectedSubmission.items || []).map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-brand-surface rounded-2xl border border-brand-border">
                              <div>
                                <div className="font-bold text-brand-dark text-xs">{item.name}</div>
                                {item.selectedIngredients && item.selectedFlavours && (
                                  <div className="text-[9px] text-brand-orange font-bold uppercase mt-0.5">
                                    Ingrédients : {Object.entries(item.selectedFlavours)
                                      .filter(([_, q]) => (q as number) > 0)
                                      .map(([f, q]) => `${q}x ${f}`)
                                      .join(', ')}
                                  </div>
                                )}
                              </div>
                              <div className="text-right whitespace-nowrap pl-4">
                                <span className="text-xs font-black text-brand-dark">{item.quantity}x</span>
                                <span className="text-[11px] font-bold text-gray-400 block">{item.price}$ / u</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Event Details */}
                      {selectedSubmission.event_details && (
                        <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl mb-8">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 block mb-1">Notes logistiques</span>
                          <p className="text-xs font-semibold text-gray-600 whitespace-pre-line">{selectedSubmission.event_details}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-end pt-4 border-t border-brand-border">
                        <div>
                          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">TPS: {selectedSubmission.tps || 0}$ | TVQ: {selectedSubmission.tvq || 0}$</div>
                          <div className="text-2xl font-black text-brand-orange mt-0.5">Total : {selectedSubmission.total_price}$</div>
                        </div>
                        <button
                          onClick={() => setSelectedSubmission(null)}
                          className="bg-brand-dark text-white text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-full hover:bg-brand-orange transition-colors"
                        >
                          Fermer
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 3: CLIENT PROFILES & CUSTOM DISCOUNTS */}
          {activeTab === 'clients' && (
            <div className="bg-white border border-brand-border rounded-[3rem] p-8 md:p-10 shadow-sm animate-fade-in-up">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight flex items-center gap-3">
                    <Users className="w-6 h-6 text-brand-orange" />
                    Profils Clients & Rabais
                  </h2>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
                    Définissez les privilèges d'accès et attribuez des rabais personnalisés par client
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-grow md:flex-initial">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filtrer par email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-brand-surface border border-brand-border rounded-full text-xs font-semibold focus:outline-none focus:border-brand-orange w-full md:w-64"
                    />
                  </div>
                  <button
                    onClick={fetchProfiles}
                    disabled={loadingProfiles}
                    className="p-2 border border-brand-border bg-brand-surface rounded-full text-gray-500 hover:text-brand-orange transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingProfiles ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {loadingProfiles && profiles.length === 0 ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-orange"></div>
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-brand-border rounded-[2rem] bg-brand-surface">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Aucun client trouvé.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProfiles.map((p) => {
                    const isSelf = p.id === user?.id;
                    const discountFactorVal = p.discount_factor !== undefined ? Number(p.discount_factor) : 1.0;
                    const currentDiscountPercent = Math.round((1 - discountFactorVal) * 100);

                    return (
                      <div 
                        key={p.id} 
                        className="bg-brand-surface border border-brand-border rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all"
                      >
                        <div className="space-y-4">
                          <div className="min-w-0">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Identifiant</span>
                            <div className="text-[11px] font-bold text-brand-dark truncate" title={p.email}>
                              {p.email}
                            </div>
                            {isSelf && (
                              <span className="text-[8px] font-bold text-brand-orange uppercase tracking-widest">(Vous)</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[8px] font-black uppercase tracking-wider text-gray-400 block mb-1">Rôle</label>
                              <select
                                disabled={updatingUser === p.id || isSelf}
                                id={`role-select-${p.id}`}
                                defaultValue={p.role || 'guest'}
                                className="w-full text-[10px] font-black uppercase tracking-wider px-3 py-2 bg-white border border-brand-border rounded-xl focus:outline-none"
                              >
                                <option value="guest">Guest</option>
                                <option value="locationb">Location B</option>
                                <option value="locationc">Location C</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[8px] font-black uppercase tracking-wider text-gray-400 block mb-1">Rabais (%)</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  id={`discount-input-${p.id}`}
                                  min="0"
                                  max="99"
                                  defaultValue={currentDiscountPercent}
                                  className="w-full text-[10px] font-black px-3 py-2 bg-white border border-brand-border rounded-xl focus:outline-none pr-6"
                                />
                                <Percent className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-brand-border flex justify-end">
                          <button
                            disabled={updatingUser === p.id}
                            onClick={() => {
                              const roleSelect = document.getElementById(`role-select-${p.id}`) as HTMLSelectElement;
                              const discountInput = document.getElementById(`discount-input-${p.id}`) as HTMLInputElement;
                              const percent = parseFloat(discountInput.value) || 0;
                              const factor = (100 - Math.min(99, Math.max(0, percent))) / 100;
                              handleUpdateProfile(p, roleSelect.value, factor);
                            }}
                            className="bg-brand-dark text-white hover:bg-brand-orange text-[9px] font-black uppercase tracking-wider px-4 py-2.5 rounded-full transition-colors flex items-center gap-1.5 shadow"
                          >
                            {updatingUser === p.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            <span>{updatingUser === p.id ? 'Sauvegarde...' : 'Enregistrer'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RENTMAN LIVE INVENTORY CHECKER */}
          {activeTab === 'inventory' && (
            <div className="bg-white border border-brand-border rounded-[3rem] p-8 md:p-10 shadow-sm animate-fade-in-up">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight flex items-center gap-3">
                  <CalendarDays className="w-6 h-6 text-brand-orange" />
                  Vérificateur d'inventaire en temps réel
                </h2>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
                  Vérifiez les réservations concurrentes de Rentman et la disponibilité nette
                </p>
              </div>

              {/* Checker Form */}
              <form onSubmit={handleInventorySearch} className="bg-brand-surface border border-brand-border rounded-[2rem] p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block pl-2">Mot-clé équipement</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      placeholder="ex: slush, table, sono..."
                      required
                      value={invSearchQuery}
                      onChange={(e) => setInvSearchQuery(e.target.value)}
                      className="w-full bg-white border border-brand-border rounded-xl py-3.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block pl-2">Date de début</label>
                  <input
                    type="date"
                    required
                    value={invStartDate}
                    onChange={(e) => setInvStartDate(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-xl py-3.5 px-4 text-xs font-semibold focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block pl-2">Date de fin</label>
                  <input
                    type="date"
                    required
                    value={invEndDate}
                    onChange={(e) => setInvEndDate(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-xl py-3.5 px-4 text-xs font-semibold focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingInv}
                  className="w-full bg-brand-dark text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-brand-orange disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow"
                >
                  {loadingInv ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Rechercher</span>
                </button>
              </form>

              {/* Search Results */}
              {loadingInv && invResults.length === 0 ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-orange"></div>
                </div>
              ) : invResults.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-brand-border rounded-[2rem] bg-brand-surface">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    {invSearchQuery ? 'Aucun résultat trouvé.' : 'Entrez un mot-clé pour effectuer la vérification.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {invResults.map((item) => {
                    const isAvailable = item.available > 0;
                    return (
                      <div 
                        key={item.id} 
                        className="bg-brand-surface border border-brand-border rounded-3xl p-5 flex gap-4 items-center hover:shadow-lg transition-all"
                      >
                        <div className="w-16 h-16 bg-white border border-brand-border rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-gray-200" />
                          )}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <div className="text-xs font-bold text-brand-dark truncate">{item.name}</div>
                          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Rentman ID: {item.id}</div>
                          
                          <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] font-semibold">
                            <div className="bg-white p-2 rounded-lg border border-brand-border text-center">
                              <span className="block text-[8px] text-gray-400 font-bold uppercase">Physique</span>
                              <span className="text-brand-dark font-bold">{item.total}</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-brand-border text-center">
                              <span className="block text-[8px] text-gray-400 font-bold uppercase">Alloué</span>
                              <span className="text-brand-orange font-bold">{item.peak_allocated}</span>
                            </div>
                            <div className={`p-2 rounded-lg border text-center ${isAvailable ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                              <span className="block text-[8px] text-gray-400 font-bold uppercase">Disponible</span>
                              <span className={`font-black ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>{item.available}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SALES & SYNC ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-12 animate-fade-in-up">
              {loadingAnalytics && !analyticsData ? (
                <div className="py-12 flex justify-center bg-white border border-brand-border rounded-[3rem]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-orange"></div>
                </div>
              ) : !analyticsData ? (
                <div className="text-center py-12 bg-white border border-brand-border rounded-[3rem]">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Erreur lors de la récupération des statistiques.</p>
                </div>
              ) : (
                <>
                  {/* Aggregates row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="bg-white border border-brand-border rounded-[2rem] p-6 shadow-sm">
                      <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mb-4 border border-orange-100">
                        <DollarSign className="w-5 h-5 text-brand-orange" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Montant total</span>
                      <p className="text-2xl font-black text-brand-dark">{analyticsData.sales.totalValue}$</p>
                    </div>

                    <div className="bg-white border border-brand-border rounded-[2rem] p-6 shadow-sm">
                      <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Confirmés</span>
                      <p className="text-2xl font-black text-brand-dark">{analyticsData.sales.confirmedValue}$</p>
                      <span className="text-[9px] font-bold text-gray-400 block mt-0.5">{analyticsData.sales.confirmedCount} soumissions</span>
                    </div>

                    <div className="bg-white border border-brand-border rounded-[2rem] p-6 shadow-sm">
                      <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100">
                        <Play className="w-5 h-5 text-brand-orange rotate-90" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">En attente</span>
                      <p className="text-2xl font-black text-brand-dark">{analyticsData.sales.pendingValue}$</p>
                      <span className="text-[9px] font-bold text-gray-400 block mt-0.5">{analyticsData.sales.pendingCount} soumissions</span>
                    </div>

                    <div className="bg-white border border-brand-border rounded-[2rem] p-6 shadow-sm">
                      <div className="w-10 h-10 bg-brand-surface rounded-full flex items-center justify-center mb-4 border border-brand-border">
                        <Percent className="w-5 h-5 text-brand-dark" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Moyenne</span>
                      <p className="text-2xl font-black text-brand-dark">{analyticsData.sales.averageValue}$</p>
                    </div>

                    <div className="bg-white border border-brand-border rounded-[2rem] p-6 shadow-sm">
                      <div className="w-10 h-10 bg-brand-surface rounded-full flex items-center justify-center mb-4 border border-brand-border">
                        <FileText className="w-5 h-5 text-brand-dark" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Total demandes</span>
                      <p className="text-2xl font-black text-brand-dark">{analyticsData.sales.totalCount}</p>
                    </div>
                  </div>

                  {/* Visual charts column */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* Top Products */}
                    <div className="bg-white border border-brand-border rounded-[3rem] p-8">
                      <h3 className="text-lg font-black uppercase tracking-tight text-brand-dark mb-6 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-brand-orange" />
                        Équipements les plus demandés
                      </h3>
                      
                      <div className="space-y-6">
                        {analyticsData.sales.popularProducts.length === 0 ? (
                          <div className="text-center py-6 text-xs text-gray-400 uppercase">Aucune donnée de commande</div>
                        ) : (
                          analyticsData.sales.popularProducts.map((prod: any, idx: number) => {
                            const maxQty = analyticsData.sales.popularProducts[0].count;
                            const widthPercent = maxQty > 0 ? Math.round((prod.count / maxQty) * 100) : 0;
                            
                            return (
                              <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-bold">
                                  <span className="text-brand-dark truncate max-w-[280px]" title={prod.name}>{prod.name}</span>
                                  <span className="text-brand-orange">{prod.count} réservations ({prod.totalRevenue}$)</span>
                                </div>
                                <div className="w-full bg-brand-surface h-3 rounded-full overflow-hidden border border-brand-border">
                                  <div 
                                    className="bg-brand-orange h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${widthPercent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Top Categories & Sync Health */}
                    <div className="space-y-6">
                      {/* Popular categories */}
                      <div className="bg-white border border-brand-border rounded-[3rem] p-8">
                        <h3 className="text-lg font-black uppercase tracking-tight text-brand-dark mb-6 flex items-center gap-2">
                          <BarChart2 className="w-5 h-5 text-brand-orange" />
                          Catégories d'expertise populaires
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {analyticsData.sales.popularCategories.length === 0 ? (
                            <div className="col-span-2 text-center py-4 text-xs text-gray-400 uppercase">Aucune catégorie</div>
                          ) : (
                            analyticsData.sales.popularCategories.map((cat: any, idx: number) => (
                              <div key={idx} className="p-4 bg-brand-surface rounded-2xl border border-brand-border text-center">
                                <span className="block text-[8px] font-black uppercase tracking-wider text-gray-400 mb-1">{cat.name}</span>
                                <span className="text-lg font-black text-brand-dark">{cat.count} items</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Background Sync Performance */}
                      <div className="bg-white border border-brand-border rounded-[3rem] p-8">
                        <h3 className="text-lg font-black uppercase tracking-tight text-brand-dark mb-6 flex items-center gap-2">
                          <Database className="w-5 h-5 text-brand-orange" />
                          Performance des synchronisations
                        </h3>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                            <span className="block text-[8px] text-gray-400 font-bold uppercase mb-0.5">Taux Succès</span>
                            <span className="text-base font-black text-green-600">
                              {analyticsData.sync.totalSyncs > 0 
                                ? `${Math.round((analyticsData.sync.successSyncs / analyticsData.sync.totalSyncs) * 100)}%` 
                                : '100%'}
                            </span>
                          </div>
                          <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                            <span className="block text-[8px] text-gray-400 font-bold uppercase mb-0.5">Durée Moyenne</span>
                            <span className="text-base font-black text-brand-dark">
                              {(analyticsData.sync.avgDurationMs / 1000).toFixed(1)}s
                            </span>
                          </div>
                          <div className="p-3 bg-brand-surface border border-brand-border rounded-xl">
                            <span className="block text-[8px] text-gray-400 font-bold uppercase mb-0.5">Erreurs</span>
                            <span className="text-base font-black text-red-600">
                              {analyticsData.sync.errorSyncs}
                            </span>
                          </div>
                        </div>

                        {analyticsData.sync.latestSync && (
                          <div className="mt-6 p-4 bg-brand-surface rounded-2xl border border-brand-border flex items-center justify-between text-xs font-semibold">
                            <div>
                              <span className="text-[8px] text-gray-400 font-bold uppercase block">Dernier Sync Status</span>
                              <span className="text-brand-dark font-black">{analyticsData.sync.latestSync.source}</span>
                            </div>
                            <div>
                              <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${
                                analyticsData.sync.latestSync.status === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                              }`}>
                                {analyticsData.sync.latestSync.status}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

