'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { Header } from '../../components/Header'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/login?message=Votre mot de passe a été réinitialisé.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-poppins">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
              Nouveau <span className="text-brand-orange">Mot de passe</span>
            </h1>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              Veuillez entrer votre nouveau mot de passe.
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange/5 rounded-full blur-3xl group-hover:bg-brand-orange/10 transition-colors duration-700"></div>
            
            <form onSubmit={handleUpdate} className="relative z-10 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest p-4 rounded-2xl border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-6 py-4 rounded-full bg-brand-surface border border-brand-border focus:border-brand-dark focus:ring-0 transition-all outline-none text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                <span>{loading ? 'Mise à jour...' : 'Réinitialiser'}</span>
                {!loading && (
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
