// ==========================================
// TYPES ET INTERFACES
// ==========================================

type ShortcutHandler = (event: KeyboardEvent) => void

interface Shortcut {
  key: string // Lettre majuscule (ex: 'L', 'K') ou nom de touche (ex: 'Escape')
  meta?: boolean // Cmd (Mac) ou Ctrl (Windows/Linux)
  shift?: boolean
  alt?: boolean
  context?: 'global' | 'focus-mode' | string // Contexte d'activation
  handler: ShortcutHandler
  description: string
}

// ==========================================
// GESTIONNAIRE DE RACCOURCIS CLAVIER
// ==========================================

class KeyboardShortcutManager {
  private shortcuts: Map<string, Shortcut> = new Map()
  private isInitialized = false

  /**
   * Génère une clé unique pour identifier un raccourci
   */
  private getShortcutKey(shortcut: Omit<Shortcut, 'handler' | 'description'>): string {
    const modifiers = [
      shortcut.meta ? 'meta' : '',
      shortcut.shift ? 'shift' : '',
      shortcut.alt ? 'alt' : '',
    ]
      .filter(Boolean)
      .join('+')

    return `${modifiers}${modifiers ? '+' : ''}${shortcut.key.toLowerCase()}`
  }

  /**
   * Enregistre un nouveau raccourci clavier
   */
  register(shortcut: Shortcut): void {
    const key = this.getShortcutKey(shortcut)

    // Prévention des conflits
    if (this.shortcuts.has(key)) {
      console.warn(`⚠️ Shortcut conflict: ${key} is already registered. Overwriting...`)
    }

    this.shortcuts.set(key, shortcut)

    // Initialise le listener si ce n'est pas encore fait
    if (!this.isInitialized) {
      this.init()
    }

    console.log(`✅ Registered shortcut: ${key} - ${shortcut.description}`)
  }

  /**
   * Désenregistre un raccourci
   */
  unregister(key: string): void {
    if (this.shortcuts.delete(key)) {
      console.log(`🗑️ Unregistered shortcut: ${key}`)
    }
  }

  /**
   * Vérifie si on est dans un élément de saisie
   */
  private isInputElement(element: Element | null): boolean {
    if (!element) return false

    const tagName = element.tagName.toLowerCase()
    const isInput = tagName === 'input' || tagName === 'textarea'
    const isContentEditable = element.getAttribute('contenteditable') === 'true'

    return isInput || isContentEditable
  }

  /**
   * Vérifie si le contexte actuel correspond au contexte du raccourci
   */
  private matchesContext(context?: string): boolean {
    if (!context || context === 'global') return true

    // Contexte focus-mode
    if (context === 'focus-mode') {
      return document.body.classList.contains('focus-mode')
    }

    // Autres contextes personnalisés
    return document.body.classList.contains(context)
  }

  /**
   * Gestionnaire principal des événements clavier
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    // Ignore les raccourcis si on est dans un champ de saisie
    if (this.isInputElement(event.target as Element)) {
      return
    }

    // Construit la clé du raccourci pressé
    const key = event.key.toLowerCase()
    const modifiers = [
      event.metaKey || event.ctrlKey ? 'meta' : '',
      event.shiftKey ? 'shift' : '',
      event.altKey ? 'alt' : '',
    ]
      .filter(Boolean)
      .join('+')

    const shortcutKey = `${modifiers}${modifiers ? '+' : ''}${key}`

    // Cherche le raccourci correspondant
    const shortcut = this.shortcuts.get(shortcutKey)

    if (shortcut) {
      // Vérifie le contexte
      if (this.matchesContext(shortcut.context)) {
        event.preventDefault()
        console.log(`🎹 Shortcut triggered: ${shortcutKey} - ${shortcut.description}`)
        shortcut.handler(event)
      }
    }
  }

  /**
   * Initialise le gestionnaire (attache le listener)
   */
  private init(): void {
    if (this.isInitialized) return

    document.addEventListener('keydown', this.handleKeyDown)
    this.isInitialized = true
    console.log('⌨️ Keyboard Shortcut Manager initialized')
  }

  /**
   * Nettoie le gestionnaire (détache le listener)
   */
  destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown)
    this.shortcuts.clear()
    this.isInitialized = false
    console.log('🧹 Keyboard Shortcut Manager destroyed')
  }

  /**
   * Liste tous les raccourcis enregistrés
   */
  list(): Array<{ key: string; description: string; context?: string }> {
    return Array.from(this.shortcuts.entries()).map(([key, shortcut]) => ({
      key,
      description: shortcut.description,
      context: shortcut.context,
    }))
  }
}

// ==========================================
// INSTANCE GLOBALE
// ==========================================

const keyboardShortcuts = new KeyboardShortcutManager()

// Réinitialise après les navigations Astro (View Transitions)
document.addEventListener('astro:after-swap', () => {
  console.log('🔄 Reinitializing shortcuts after navigation')
})

// Expose dans la console pour debugging (dev only)
if (import.meta.env.DEV) {
  ;(window as any).__shortcuts = keyboardShortcuts
  console.log('💡 Tip: Use __shortcuts.list() in console to see all registered shortcuts')
}

// ==========================================
// EXPORTS
// ==========================================

export { keyboardShortcuts }
export type { Shortcut, ShortcutHandler }
