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

interface SequenceShortcut {
  sequence: string // Séquence de touches (ex: 'gc', 'gg')
  maxDelay?: number // Délai max entre les touches en ms (défaut: 500ms)
  context?: 'global' | 'focus-mode' | string
  handler: () => void
  description: string
}

// ==========================================
// GESTIONNAIRE DE RACCOURCIS CLAVIER
// ==========================================

class KeyboardShortcutManager {
  private shortcuts: Map<string, Shortcut> = new Map()
  private sequences: Map<string, SequenceShortcut> = new Map()
  private isInitialized = false
  private sequenceBuffer: string[] = []
  private sequenceTimer: number | null = null

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
   * Enregistre une séquence de touches
   */
  registerSequence(sequence: SequenceShortcut): void {
    const key = sequence.sequence.toLowerCase()

    // Prévention des conflits
    if (this.sequences.has(key)) {
      console.warn(`⚠️ Sequence conflict: ${key} is already registered. Overwriting...`)
    }

    this.sequences.set(key, sequence)

    // Initialise le listener si ce n'est pas encore fait
    if (!this.isInitialized) {
      this.init()
    }

    console.log(`✅ Registered sequence: ${key} - ${sequence.description}`)
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
   * Désenregistre une séquence
   */
  unregisterSequence(sequence: string): void {
    const key = sequence.toLowerCase()
    if (this.sequences.delete(key)) {
      console.log(`🗑️ Unregistered sequence: ${key}`)
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
   * Réinitialise le buffer de séquence
   */
  private resetSequenceBuffer(): void {
    this.sequenceBuffer = []
    if (this.sequenceTimer !== null) {
      window.clearTimeout(this.sequenceTimer)
      this.sequenceTimer = null
    }
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
    const hasModifiers = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey

    // Gestion des séquences (seulement si pas de modificateurs)
    if (!hasModifiers && this.sequences.size > 0) {
      this.sequenceBuffer.push(key)
      const currentSequence = this.sequenceBuffer.join('')

      // Cherche une séquence correspondante
      const matchingSequence = this.sequences.get(currentSequence)

      if (matchingSequence) {
        // Séquence trouvée
        if (this.matchesContext(matchingSequence.context)) {
          event.preventDefault()
          console.log(`🎯 Sequence triggered: ${currentSequence} - ${matchingSequence.description}`)
          matchingSequence.handler()
          this.resetSequenceBuffer()
          return
        }
      }

      // Cherche si le début correspond à une séquence potentielle
      const hasPotentialMatch = Array.from(this.sequences.keys()).some((seq) =>
        seq.startsWith(currentSequence)
      )

      if (hasPotentialMatch) {
        // Continue à attendre la suite de la séquence
        const maxDelay = matchingSequence?.maxDelay ?? 500

        // Clear le timer précédent
        if (this.sequenceTimer !== null) {
          window.clearTimeout(this.sequenceTimer)
        }

        // Reset après le délai
        this.sequenceTimer = window.setTimeout(() => {
          this.resetSequenceBuffer()
        }, maxDelay)

        return
      } else {
        // Pas de correspondance, reset
        this.resetSequenceBuffer()
      }
    }

    // Gestion des raccourcis classiques
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
    this.sequences.clear()
    this.resetSequenceBuffer()
    this.isInitialized = false
    console.log('🧹 Keyboard Shortcut Manager destroyed')
  }

  /**
   * Liste tous les raccourcis enregistrés
   */
  list(): Array<{ key: string; description: string; context?: string; type: 'shortcut' | 'sequence' }> {
    const shortcuts = Array.from(this.shortcuts.entries()).map(([key, shortcut]) => ({
      key,
      description: shortcut.description,
      context: shortcut.context,
      type: 'shortcut' as const,
    }))

    const sequences = Array.from(this.sequences.entries()).map(([key, sequence]) => ({
      key,
      description: sequence.description,
      context: sequence.context,
      type: 'sequence' as const,
    }))

    return [...shortcuts, ...sequences]
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
export type { Shortcut, ShortcutHandler, SequenceShortcut }
