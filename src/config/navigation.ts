/* -------------------------------------------------------------------
   Config navigation : logo & liens par défaut
   -------------------------------------------------------------------
   - On importe le type NavLink pour typer le tableau (auto-complétion)
   - On expose deux exports :
       1) defaultLogo   → chaîne (URL) utilisée si Navbar ne reçoit rien
       2) defaultLinks  → tableau de liens réutilisable
-------------------------------------------------------------------- */

import type { NavLink } from '@/types/navigation'
import mainLogo from '@assets/logos/logo-main.svg'

/** Logo par défaut pour le thème clair */
export const defaultLogo: string = mainLogo.src

/** Variante utilisée automatiquement en mode sombre */
export const defaultLogoDark: string = mainLogo.src

/** Liens par défaut – peuvent être overridés via la prop `links` */
export const defaultLinks: NavLink[] = [
  { href: '/', label: 'Accueil' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
] satisfies NavLink[]
