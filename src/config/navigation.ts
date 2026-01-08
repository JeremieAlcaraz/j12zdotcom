/* -------------------------------------------------------------------
   Config navigation : logo & liens par défaut
   -------------------------------------------------------------------
   - On importe le type NavLink pour typer le tableau (auto-complétion)
   - On expose deux exports :
       1) defaultLogo   → chaîne (URL) utilisée si Navbar ne reçoit rien
       2) defaultLinks  → tableau de liens réutilisable
-------------------------------------------------------------------- */

import type { NavLink } from '@/types/navigation'
import mainLogo from '@assets/logos/logo.svg'

/** Logo par défaut pour le thème clair */
export const defaultLogo: string = mainLogo.src

/** Variante utilisée automatiquement en mode sombre */
export const defaultLogoDark: string = mainLogo.src

/** Liens par défaut – peuvent être overridés via la prop `links` */
export const defaultLinks: NavLink[] = [
  {
    href: '/',
    label: 'Accueil',
    tooltip: "Ton point de départ vers une productivité plus douce ✨",
  },
  {
    href: '/blog',
    label: 'Blog',
    tooltip: "Découvre des réflexions et astuces pour avancer en douceur 📝",
  },
  {
    label: 'Events',
    tooltip: "Des moments pour se retrouver et grandir ensemble 🌱",
    children: [
      {
        href: '/events/me',
        label: 'Mes Events',
        tooltip: "Les événements que j'organise avec soin 💫",
      },
      {
        href: '/events/community',
        label: 'Événements Communautaires',
        tooltip: "Rejoins notre communauté bienveillante 🤝",
      },
    ],
  },
  {
    href: '/s-equiper',
    label: "S'équiper",
    tooltip: "Mes meilleurs outils et systèmes pour gagner du temps en douceur 🫶🌸",
  },
  {
    label: 'À propos',
    children: [
      {
        href: '/qui-suis-je',
        label: 'Qui suis-je ?',
        tooltip: "Apprends à me connaître et découvre mon parcours 💜",
      },
      {
        href: '/now',
        label: 'Now',
        tooltip: "Ce qui m'occupe en ce moment 🌿",
      },
    ],
  },
  {
    href: '/contact',
    label: 'Contact',
    tooltip: "Envie d'échanger ? Je serais ravi de te lire 💌",
  },
] satisfies NavLink[]
