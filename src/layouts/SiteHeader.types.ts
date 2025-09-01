/* ------------------------------------------------------------------
   Types partagés par tous les sous-composants de la navbar
------------------------------------------------------------------- */

/** Un lien de navigation classique */
export interface NavLink {
  href: string
  label: string
}

/** Props acceptées par <Navbar /> */
export interface NavbarProps {
  /** URL absolue ou relative du logo affiché à gauche */
  logo?: string
  /** Tableau des liens principaux (ordre d’affichage) */
  links?: NavLink[]
}
