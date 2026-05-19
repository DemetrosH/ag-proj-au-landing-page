export type UserRole = 'guest' | 'locationb' | 'locationc' | 'admin'

export interface AccessRules {
  hideCats: string[]
  hideTags: string[]
  requiredTags?: string[]
}

export const URBA_ACCESS_RULES: Record<UserRole, AccessRules> = {
  guest: {
    hideCats: [
      'appareils-electronique', 
      'communication', 
      'divers', 
      'populaire', 
      'production-audiovideo', 
      'produits-vedette', 
      'projecteursaccessoires', 
      'tapis', 
      'uncategorized', 
      'vehicule'
    ],
    hideTags: ['location b', 'location c'],
    requiredTags: ['location a'],
  },
  locationb: {
    hideCats: ['vehicule', 'divers'],
    hideTags: ['location b'],
    requiredTags: ['location c'],
  },
  locationc: {
    hideCats: [],
    hideTags: ['location c'],
    requiredTags: ['location b'],
  },
  admin: {
    hideCats: [],
    hideTags: [],
  },
}

/**
 * Generates a GROQ filter snippet for Sanity based on user role.
 */
export function getVisibilityFilters(role: UserRole = 'guest', categoryFieldName: string = 'category.slug.current') {
  const rules = URBA_ACCESS_RULES[role] || URBA_ACCESS_RULES.guest
  
  const filters: string[] = []
  
  if (rules.hideCats.length > 0) {
    filters.push(`!(${categoryFieldName} in ${JSON.stringify(rules.hideCats)})`)
  }
  
  if (rules.hideTags.length > 0) {
    filters.push(`!(tags in ${JSON.stringify(rules.hideTags)})`)
  }
  
  return filters.length > 0 ? filters.join(' && ') : 'true'
}
