import { createClient } from './supabase/server'
import { UserRole, URBA_ACCESS_RULES } from './access-control'

export async function getUserProfile() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  return profile
}

export async function getUserRole(): Promise<UserRole> {
  const profile = await getUserProfile()
  return (profile?.role as UserRole) || 'guest'
}

export async function getVisibilitySettings() {
  const role = await getUserRole()
  return URBA_ACCESS_RULES[role] || URBA_ACCESS_RULES.guest
}
