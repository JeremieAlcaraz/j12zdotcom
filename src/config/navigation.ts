/* -------------------------------------------------------------------
   Config navigation : logo & liens par défaut
   -------------------------------------------------------------------
   - On importe le type NavLink pour typer le tableau (auto-complétion)
   - On expose deux exports :
       1) defaultLogo   → chaîne (URL) utilisée si Navbar ne reçoit rien
       2) defaultLinks  → tableau de liens réutilisable
-------------------------------------------------------------------- */

import type { NavLink } from '@components/navbar/Navbar.types';
import astroLogo from '@assets/astro.svg';

/** Logo par défaut – peut être surchargé via la prop `logo` de <Navbar /> */
export const defaultLogo: string = astroLogo.src;

/** Liens par défaut – peuvent être overridés via la prop `links` */
export const defaultLinks: NavLink[] = [
  { href: '/', label: 'Accueil' },
  { href: '/about', label: 'À propos' },
  { href: '/blog', label: 'Blog' },
] satisfies NavLink[];
