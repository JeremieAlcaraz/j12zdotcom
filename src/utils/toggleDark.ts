// ==========================================
// CONSTANTES ET UTILITAIRES
// ==========================================

// CLÉ pour stocker le thème dans localStorage du navigateur
const THEME_STORAGE_KEY = 'theme'

// FONCTION UTILITAIRE : vérifie si le thème actuel est sombre
// Lit l'attribut 'data-theme' sur l'élément <html>
const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark'

// ==========================================
// FONCTION DE MISE À JOUR DU THÈME
// ==========================================

// APPLIQUE le thème (sombre ou clair) à la page
const updateTheme = (isDarkValue: boolean) => {
  // CHANGE l'attribut data-theme sur <html> pour appliquer le thème
  // 'dark' ou 'douceurLight' (thème personnalisé clair)
  document.documentElement.setAttribute('data-theme', isDarkValue ? 'dark' : 'douceurLight')

  // RÉCUPÈRE les éléments des icônes soleil et lune
  const sunIcon = document.getElementById('sun-icon')
  const moonIcon = document.getElementById('moon-icon')

  // AFFICHE/CACHE les icônes selon le thème
  if (sunIcon && moonIcon) {
    // Si thème sombre : cache soleil, montre lune
    // Si thème clair : montre soleil, cache lune
    sunIcon.classList.toggle('hidden', isDarkValue) // Cache si sombre
    moonIcon.classList.toggle('hidden', !isDarkValue) // Cache si clair
  }

  // MET À JOUR LE LOGO PRINCIPAL
  const mainLogo = document.getElementById('main-logo') as HTMLImageElement | null
  if (mainLogo) {
    const lightSrc = mainLogo.dataset.logoLight
    const darkSrc = mainLogo.dataset.logoDark
    if (lightSrc && darkSrc) {
      mainLogo.src = isDarkValue ? darkSrc : lightSrc
    }
  }
}

// ==========================================
// FONCTION D'INITIALISATION DES ICÔNES
// ==========================================

// CONFIGURE l'affichage initial des icônes selon le thème
const setupIcons = () => {
  const currentThemeIsDark = isDark()
  const sunIcon = document.getElementById('sun-icon')
  const moonIcon = document.getElementById('moon-icon')

  if (sunIcon && moonIcon) {
    sunIcon.classList.toggle('hidden', currentThemeIsDark)
    moonIcon.classList.toggle('hidden', !currentThemeIsDark)
  }

  const mainLogo = document.getElementById('main-logo') as HTMLImageElement | null
  if (mainLogo) {
    const lightSrc = mainLogo.dataset.logoLight
    const darkSrc = mainLogo.dataset.logoDark
    if (lightSrc && darkSrc) {
      mainLogo.src = currentThemeIsDark ? darkSrc : lightSrc
    }
  }
}

// ==========================================
// FONCTION DE BASCULEMENT DU THÈME
// ==========================================

// GÈRE le clic sur le bouton de changement de thème
const toggleTheme = (event: MouseEvent) => {
  // VÉRIFIE si les transitions visuelles sont supportées et activées
  // document.startViewTransition = API expérimentale pour les transitions
  // prefers-reduced-motion = préférence utilisateur pour réduire les animations
  const isAppearanceTransition =
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // CAS SIMPLE : pas de transition animée
  if (!isAppearanceTransition) {
    const newThemeIsDark = !isDark() // Inverse le thème actuel
    updateTheme(newThemeIsDark) // Applique le nouveau thème
    // SAUVEGARDE dans localStorage pour persistance
    localStorage.setItem(THEME_STORAGE_KEY, newThemeIsDark ? 'dark' : 'douceurLight')
    return
  }

  // ==========================================
  // TRANSITION ANIMÉE (cercle qui s'agrandit)
  // ==========================================

  // RÉCUPÈRE les coordonnées du clic de souris
  const x = event.clientX
  const y = event.clientY

  // CALCULE le rayon nécessaire pour couvrir tout l'écran
  // Math.hypot = calcule la distance euclidienne
  // On prend la plus grande distance depuis le point de clic jusqu'aux coins
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x), // Distance horizontale max
    Math.max(y, window.innerHeight - y) // Distance verticale max
  )

  // DÉSACTIVE temporairement les animations ClientRouter via JavaScript
  const style = document.createElement('style')
  style.id = 'temp-disable-transitions'
  style.textContent = `
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation: none !important;
      mix-blend-mode: normal !important;
    }
  `
  document.head.appendChild(style)

  // DÉMARRE la transition avec l'API View Transitions
  const transition = document.startViewTransition(() => {
    const newThemeIsDark = !isDark() // Inverse le thème
    updateTheme(newThemeIsDark) // Applique le changement
    // SAUVEGARDE le nouveau thème
    localStorage.setItem(THEME_STORAGE_KEY, newThemeIsDark ? 'dark' : 'douceurLight')
  })

  // ANIME la transition une fois qu'elle est prête
  void transition.ready.then(() => {
    // DÉFINIT les keyframes de l'animation : cercle qui grandit
    const clipPath = [
      `circle(0px at ${String(x)}px ${String(y)}px)`,
      `circle(${String(endRadius)}px at ${String(x)}px ${String(y)}px)`
    ]

    // LANCE l'animation sur la nouvelle vue qui apparaît
    const animation = document.documentElement.animate(
      {
        clipPath: clipPath, // Animation du cercle qui s'agrandit
      },
      {
        duration: 500, // Durée : 500ms
        easing: 'ease-in-out', // Courbe d'animation
        pseudoElement: '::view-transition-new(root)', // Cible la nouvelle vue
      }
    )

    // RÉACTIVE les transitions ClientRouter avec un petit délai pour éviter le flash
    animation.addEventListener('finish', () => {
      setTimeout(() => {
        document.getElementById('temp-disable-transitions')?.remove()
      }, 50) // Délai de 50ms pour stabiliser
    })
  })
}

// ==========================================
// INITIALISATION AU CHARGEMENT
// ==========================================

// ATTACHE l'événement de clic au bouton de changement de thème
// ?. = optional chaining (évite l'erreur si l'élément n'existe pas)
function initThemeButton() {
  setupIcons()
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme)
}

// Initialisation au chargement
initThemeButton()

// Réinitialisation après chaque navigation ViewTransition
document.addEventListener('astro:after-swap', initThemeButton)
