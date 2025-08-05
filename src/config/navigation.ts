/* -------------------------------------------------------------------
   Config navigation : logo & liens par défaut
   -------------------------------------------------------------------
   - On importe le type NavLink pour typer le tableau (auto-complétion)
   - On expose deux exports :
       1) defaultLogo   → chaîne (URL) utilisée si Navbar ne reçoit rien
       2) defaultLinks  → tableau de liens réutilisable
-------------------------------------------------------------------- */

import type { NavLink } from '@components/common/Header/Header.types';
import logo from '@assets/logo.svg';

/** Logo par défaut – peut être surchargé via la prop `logo` de <Navbar /> */
export const defaultLogo: string = logo.src;

/** Liens par défaut – peuvent être overridés via la prop `links` */
export const defaultLinks: NavLink[] = [
  { href: '/', label: 'Accueil' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
] satisfies NavLink[];
