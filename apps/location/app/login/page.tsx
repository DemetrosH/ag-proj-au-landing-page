'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { Header } from '../../components/Header'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setSuccessMessage(params.get('message'))
    }
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-poppins">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4 py-20">
        <div className="w-full max-w-md">
          {/* Brand Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
              Connexion <span className="text-brand-orange">Client</span>
            </h1>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              Connectez-vous pour gérer vos soumissions et accéder à vos services.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white border border-brand-border rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            {/* Subtle glow effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange/5 rounded-full blur-3xl group-hover:bg-brand-orange/10 transition-colors duration-700"></div>
            
            <form onSubmit={handleLogin} className="relative z-10 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest p-4 rounded-2xl border border-red-100">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-50 text-green-600 text-xs font-bold uppercase tracking-widest p-4 rounded-2xl border border-green-100">
                  {successMessage}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Email Professionnel</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@entreprise.com"
                  required
                  className="w-full px-6 py-4 rounded-full bg-brand-surface border border-brand-border focus:border-brand-dark focus:ring-0 transition-all outline-none text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Mot de passe</label>
                  <Link 
                    href="/forgot-password"
                    className="text-[9px] font-black uppercase tracking-widest text-brand-orange hover:text-brand-dark transition-colors"
                  >
                    Oublié ?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-6 py-4 rounded-full bg-brand-surface border border-brand-border focus:border-brand-dark focus:ring-0 transition-all outline-none text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-dark text-white font-black uppercase tracking-[0.2em] py-5 rounded-full hover:bg-brand-orange transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center space-x-3 mt-4"
              >
                <span>{loading ? 'Connexion...' : 'Se Connecter'}</span>
                {!loading && (
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-border"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                <span className="bg-white px-4 text-gray-400">Ou continuer avec</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-1 gap-4 relative z-10">
              <button
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center space-x-4 px-6 py-4 rounded-full border border-brand-border bg-white hover:bg-brand-surface hover:border-gray-300 transition-all shadow-lg group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark">Continuer avec Google</span>
              </button>
            </div>
          </div>

          {/* Request Account Section */}
          <div className="mt-12 text-center">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">
              Professionnel de l'événementiel ?
            </p>
            <div className="flex flex-col space-y-4 items-center">
              <Link 
                href="/devenir-partenaire"
                className="text-sm font-black uppercase tracking-[0.1em] text-brand-orange hover:text-brand-dark transition-colors inline-flex items-center space-x-2"
              >
                <span>Demander un accès partenaire</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link 
                href="/signup"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-brand-dark transition-colors"
              >
                Créer un compte client
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
