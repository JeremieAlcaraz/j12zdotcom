// ==========================================
// RACCOURCIS CLAVIER DE NAVIGATION
// ==========================================

import { keyboardShortcuts } from './keyboardShortcuts'

// ==========================================
// SÉQUENCES DE NAVIGATION (style Vim)
// ==========================================

// 'gh' - GO TO HOME
keyboardShortcuts.registerSequence({
  sequence: 'gh',
  maxDelay: 500,
  context: 'global',
  handler: () => {
    window.location.href = '/'
  },
  description: 'Navigate to home page (gh sequence)',
})

// 'gc' - GO TO CONTACT
keyboardShortcuts.registerSequence({
  sequence: 'gc',
  maxDelay: 500,
  context: 'global',
  handler: () => {
    window.location.href = '/contact'
  },
  description: 'Navigate to contact page (gc sequence)',
})

// ==========================================
// AUTRES RACCOURCIS À AJOUTER (OPTIONNEL)
// ==========================================

// Tu peux ajouter d'autres séquences ici, par exemple :
// - 'gb' pour aller au blog
// - 'gp' pour aller aux projets
// - 'gs' pour aller aux services
// etc.
