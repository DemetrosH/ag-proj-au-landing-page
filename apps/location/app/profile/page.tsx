'use client';

import React from 'react';
import { Header } from '../../components/Header';
import { createClient } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [soumissions, setSoumissions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClient();
  const router = useRouter();

  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      // Fetch Soumissions
      const { data: soumissionsData } = await supabase
        .from('soumissions')
        .select('*')
        .order('created_at', { ascending: false });
      setSoumissions(soumissionsData || []);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-orange"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar / Profile Info */}
          <div className="lg:w-1/3">
            <div className="bg-brand-surface rounded-[3rem] p-10 border border-brand-border sticky top-32">
              <div className="w-24 h-24 bg-brand-dark rounded-full flex items-center justify-center text-white text-3xl font-black mb-8 mx-auto shadow-2xl shadow-brand-dark/20 uppercase">
                {profile?.full_name?.[0] || user?.email?.[0] || '?'}
              </div>
              
              <div className="text-center mb-10">
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">{profile?.full_name || 'Utilisateur'}</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{user?.email}</p>
                <div className="mt-4 inline-block bg-white px-4 py-1.5 rounded-full border border-brand-border text-[10px] font-black uppercase tracking-widest text-brand-orange">
                  Niveau {profile?.role?.toUpperCase() || 'GUEST'}
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-brand-border">
                <button 
                  onClick={handleLogout}
                  className="w-full bg-white border border-brand-border text-brand-dark font-black uppercase tracking-[0.2em] py-4 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all text-xs"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* Main Content / History */}
          <div className="lg:w-2/3">
            <div className="flex justify-between items-end mb-10">
              <h2 className="text-4xl font-black text-brand-dark uppercase tracking-tighter">Mes <span className="text-brand-orange">Soumissions</span></h2>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{soumissions.length} Total</span>
            </div>

            {soumissions.length === 0 ? (
              <div className="bg-brand-surface rounded-[3rem] p-16 text-center border border-brand-border border-dashed">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-6">Vous n'avez pas encore fait de demande.</p>
                <Link href="/" className="text-brand-orange font-black uppercase tracking-widest text-xs hover:underline">
                  Commencer à explorer
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {soumissions.map((s) => {
                  const isExpanded = expandedId === s.id;
                  return (
                    <div 
                      key={s.id} 
                      className={`bg-white border border-brand-border rounded-[2.5rem] transition-all duration-500 overflow-hidden relative ${
                        isExpanded ? 'ring-2 ring-brand-orange shadow-2xl' : 'hover:shadow-xl'
                      }`}
                    >
                      {/* Main Header / Summary (Clickable to Toggle) */}
                      <div 
                        onClick={() => toggleExpand(s.id)}
                        className="p-8 cursor-pointer group"
                      >
                        <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ID #{s.id.slice(0, 8)}</span>
                              <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                s.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                s.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' :
                                'bg-red-50 text-red-600 border-red-100'
                              }`}>
                                {s.status}
                              </span>
                            </div>
                            <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight mb-4">
                              {s.items?.length || 0} Articles - {s.total_price}$
                            </h3>
                            <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                              <div className="flex items-center gap-2 bg-brand-surface px-3 py-1.5 rounded-full border border-brand-border">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {s.start_date} au {s.end_date}
                              </div>
                              <div className="flex items-center gap-2 bg-brand-surface px-3 py-1.5 rounded-full border border-brand-border">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(s.created_at).toLocaleDateString('fr-CA')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-6">
                            <div className="flex -space-x-4">
                              {s.items?.slice(0, 3).map((item: any, i: number) => (
                                <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-brand-surface overflow-hidden shadow-lg flex items-center justify-center">
                                  {item.image ? (
                                    <img src={item.image} alt="" className="w-full h-full object-contain p-1" />
                                  ) : (
                                    <span className="text-[8px] font-black uppercase">{item.name[0]}</span>
                                  )}
                                </div>
                              ))}
                              {s.items?.length > 3 && (
                                <div className="w-12 h-12 rounded-full border-4 border-white bg-brand-dark text-white text-[10px] font-black flex items-center justify-center shadow-lg relative z-10">
                                  +{s.items.length - 3}
                                </div>
                              )}
                            </div>
                            
                            <div className={`w-10 h-10 rounded-full border border-brand-border flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-brand-orange border-brand-orange text-white' : 'group-hover:bg-brand-surface'}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="border-t border-brand-border"
                          >
                            <div className="p-8 space-y-8 bg-gray-50/50">
                              
                              {/* 1. Itemized List */}
                              <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-4">Détails de l'équipement</h4>
                                <div className="bg-white border border-brand-border rounded-[1.5rem] overflow-hidden">
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="bg-brand-surface border-b border-brand-border">
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Article</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Qté</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border">
                                      {s.items?.map((item: any, i: number) => (
                                        <tr key={i} className="group/row hover:bg-gray-50 transition-colors">
                                          <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                              <div className="w-10 h-10 rounded-lg border border-brand-border bg-white flex items-center justify-center p-1">
                                                {item.image ? (
                                                  <img src={item.image} alt="" className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                  </svg>
                                                )}
                                              </div>
                                              <span className="text-sm font-bold text-brand-dark line-clamp-1">{item.name}</span>
                                            </div>
                                          </td>
                                          <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-black text-brand-dark">x{item.quantity}</span>
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-black text-brand-orange">{Math.round((item.price || 0) * (item.quantity || 1))}$</span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr className="bg-brand-surface/50">
                                        <td colSpan={2} className="px-6 py-5 text-right text-xs font-black uppercase tracking-widest text-gray-400">Total estimé</td>
                                        <td className="px-6 py-5 text-right text-xl font-black text-brand-dark">{s.total_price}$</td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </div>

                              {/* 2. Event Info Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white border border-brand-border p-6 rounded-[1.5rem]">
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-3">Lieu de l'événement</h4>
                                  <p className="text-sm font-bold text-brand-dark">{s.location_name || 'Non spécifié'}</p>
                                  {s.location_address && (
                                    <p className="text-xs text-gray-400 mt-1">{s.location_address}, {s.location_city}</p>
                                  )}
                                </div>
                                <div className="bg-white border border-brand-border p-6 rounded-[1.5rem]">
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-3">Détails / Remarques</h4>
                                  <p className="text-xs text-gray-500 italic leading-relaxed">
                                    {s.event_details || 'Aucune remarque particulière.'}
                                  </p>
                                </div>
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Background decoration */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-bl-[5rem] group-hover:bg-brand-orange/10 transition-colors pointer-events-none"></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
