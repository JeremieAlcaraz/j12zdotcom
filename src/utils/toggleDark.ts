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
    // Si thème sombre : montre soleil (pour revenir en clair)
    // Si thème clair : montre lune (pour passer en sombre)
    sunIcon.classList.toggle('hidden', !isDarkValue) // Montre si sombre
    moonIcon.classList.toggle('hidden', isDarkValue) // Cache si sombre
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
    sunIcon.classList.toggle('hidden', !currentThemeIsDark)
    moonIcon.classList.toggle('hidden', currentThemeIsDark)
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
    // @ts-expect-error: L'API View Transitions est expérimentale
    document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

  // AJOUTE les styles CSS pour l'effet gradient magique ✨
  const style = document.createElement('style')
  style.id = 'magical-theme-transition'
  style.textContent = `
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation: none !important;
      mix-blend-mode: normal !important;
    }

    /* EFFET GRADIENT ROSE-BLEU SPECTACULAIRE */
    .theme-gradient-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      background: conic-gradient(
        from 0deg at ${x}px ${y}px,
        #ff69b4,     /* Rose vif */
        #9d4edd,     /* Violet */
        #3b82f6,     /* Bleu */
        #06b6d4,     /* Cyan */
        #10b981,     /* Emerald */
        #f59e0b,     /* Ambre */
        #ef4444,     /* Rouge */
        #ff69b4      /* Rose vif (boucle) */
      );
      opacity: 0;
      transition: opacity 0.1s ease;
    }

    .theme-gradient-overlay.active {
      opacity: 0.15;
    }

    /* ANIMATION PULSE SUBTILE */
    @keyframes magical-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .theme-gradient-overlay.pulse {
      animation: magical-pulse 0.6s ease-in-out;
    }
  `
  document.head.appendChild(style)

  // CRÉE l'overlay gradient magique ✨
  const gradientOverlay = document.createElement('div')
  gradientOverlay.className = 'theme-gradient-overlay'
  document.body.appendChild(gradientOverlay)

  // DÉMARRE la transition avec l'API View Transitions
  const transition = document.startViewTransition(() => {
    const newThemeIsDark = !isDark() // Inverse le thème
    updateTheme(newThemeIsDark) // Applique le changement
    // SAUVEGARDE le nouveau thème
    localStorage.setItem(THEME_STORAGE_KEY, newThemeIsDark ? 'dark' : 'douceurLight')
  })

  // ANIME la transition une fois qu'elle est prête
  transition.ready.then(() => {
    // ACTIVE l'overlay gradient avec un petit délai pour l'effet
    setTimeout(() => {
      gradientOverlay.classList.add('active', 'pulse')
    }, 50)

    // DÉFINIT les keyframes de l'animation : cercle qui grandit
    const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]

    // LANCE l'animation sur la nouvelle vue qui apparaît
    const animation = document.documentElement.animate(
      {
        clipPath: clipPath, // Animation du cercle qui s'agrandit
      },
      {
        duration: 600, // Durée un peu plus longue pour profiter de l'effet : 600ms
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Courbe plus douce
        pseudoElement: '::view-transition-new(root)', // Cible la nouvelle vue
      }
    )

    // NETTOIE tout à la fin
    animation.addEventListener('finish', () => {
      // Fade out du gradient
      gradientOverlay.style.transition = 'opacity 0.3s ease-out'
      gradientOverlay.style.opacity = '0'

      setTimeout(() => {
        // Supprime les éléments
        gradientOverlay.remove()
        document.getElementById('magical-theme-transition')?.remove()
      }, 300) // Attend la fin du fade out
    })
  })
}

// ==========================================
// INITIALISATION AU CHARGEMENT
// ==========================================

// ATTACHE l'événement de clic au bouton de changement de thème
// ?. = optional chaining (évite l'erreur si l'élément n'existe pas)
function initThemeButton() {
  // D'abord, on nettoie les anciens event listeners pour éviter les doublons
  const themeButton = document.getElementById('theme-toggle')
  if (themeButton) {
    // Supprime l'ancien listener s'il existe
    themeButton.removeEventListener('click', toggleTheme)
    // Ajoute le nouveau listener
    themeButton.addEventListener('click', toggleTheme)
  }

  // Configure les icônes selon le thème actuel
  setupIcons()

  // Force une vérification du localStorage au cas où
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme) {
    const shouldBeDark = savedTheme === 'dark'
    const currentIsDark = isDark()

    // Si le thème sauvegardé ne correspond pas au thème actuel, on corrige
    if (shouldBeDark !== currentIsDark) {
      updateTheme(shouldBeDark)
    }
  }
}

// Fonction d'initialisation avec délai pour éviter les problèmes de timing
const initWithDelay = () => {
  // Petit délai pour s'assurer que le DOM est complètement mis à jour
  setTimeout(() => {
    initThemeButton()
  }, 10)
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initWithDelay)

// Réinitialisation après chaque navigation Astro
document.addEventListener('astro:after-swap', initWithDelay)

// Événement de fallback au cas où les autres ne fonctionnent pas
document.addEventListener('astro:page-load', initWithDelay)

// Initialisation immédiate si le DOM est déjà chargé
if (document.readyState === 'loading') {
  // DOM pas encore chargé, on attend DOMContentLoaded
} else {
  // DOM déjà chargé, on initialise tout de suite
  initThemeButton()
}
