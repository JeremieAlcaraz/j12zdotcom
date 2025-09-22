// src/ui/icons/icon-registry.ts

// --- Lucide (5 exemples) ---
import LucidePlay from '~icons/lucide/play'
import LucidePause from '~icons/lucide/pause'
import LucideHeart from '~icons/lucide/heart'
import LucideStar from '~icons/lucide/star'
import LucideHome from '~icons/lucide/home'

// --- Heroicons Outline (5 exemples) ---
import HiHomeO from '~icons/heroicons-outline/home'
import HiUserO from '~icons/heroicons-outline/user'
import HiBellO from '~icons/heroicons-outline/bell'
import HiSearchO from '~icons/heroicons-outline/magnifying-glass'
import HiCogO from '~icons/heroicons-outline/cog-6-tooth'

// Typage générique (tous les composants importés de ~icons/... ont le même type)
type IconComponent = typeof LucidePlay

/**
 * Aliases conviviaux de préfixes
 * Permet d'écrire "heroicons:*" au lieu de "heroicons-outline:*"
 */
export const PREFIX_ALIASES: Record<string, string> = {
  heroicon: 'heroicons',             // tolère "heroicon:*"
  'heroicons-outline': 'heroicons',  // on mappe vers "heroicons:*"
}

/**
 * Registre d’icônes (banques externes).
 * Clé = valeur à utiliser dans <Icon name="..." />.
 */
export const ICONS: Record<string, IconComponent> = {
  // Lucide
  'lucide:play': LucidePlay,
  'lucide:pause': LucidePause,
  'lucide:heart': LucideHeart,
  'lucide:star': LucideStar,
  'lucide:home': LucideHome,

  // Heroicons Outline (clés officielles)
  'heroicons-outline:home': HiHomeO,
  'heroicons-outline:user': HiUserO,
  'heroicons-outline:bell': HiBellO,
  'heroicons-outline:magnifying-glass': HiSearchO,
  'heroicons-outline:cog-6-tooth': HiCogO,

  // Aliases "heroicons:*" → outline
  'heroicons:home': HiHomeO,
  'heroicons:user': HiUserO,
  'heroicons:bell': HiBellO,
  'heroicons:magnifying-glass': HiSearchO,
  'heroicons:cog-6-tooth': HiCogO,
}

// Type des clés disponibles (pratique pour l’autocomplétion TS)
export type IconKey = keyof typeof ICONS

/**
 * Normalise le nom d’icône fourni par un agent ou un auteur.
 * - Mappe le vieux préfixe "heroicon:" vers "heroicons:" (alias outline)
 */
export function normalizeIconName(name: string) {
  return name.replace(/^heroicon:/, 'heroicons:')
}

/**
 * Convertit un nom normalisé en nom Iconify attendu par `astro-icon`.
 * - Laisse passer « heroicons:* » tel quel pour utiliser le set v2
 * - Ne force plus le mapping vers « heroicons-outline:* »
 */
export function toIconifyName(name: string) {
  return name
}
