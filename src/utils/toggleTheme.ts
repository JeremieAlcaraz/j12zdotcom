/* -------------------------------------------------------------------
   utils/theme.ts
   --------------------------------------------------------------------
   - Centralise toute la logique dark / light
   - Pourra être importé par Navbar ou Footer sans dupliquer le code
-------------------------------------------------------------------- */

export const THEME_STORAGE_KEY = 'theme'

/** Renvoie true si le document est déjà en mode dark */
export const isDark = (): boolean => document.documentElement.getAttribute('data-theme') === 'dark'

/** Applique le thème visuellement + toggle des icônes */
export function updateTheme(isDarkValue: boolean) {
  document.documentElement.setAttribute('data-theme', isDarkValue ? 'dark' : 'douceurLight')

  // On masque / affiche les icônes selon le thème
  document.getElementById('sun-icon')?.classList.toggle('hidden', isDarkValue)
  document.getElementById('moon-icon')?.classList.toggle('hidden', !isDarkValue)
}
