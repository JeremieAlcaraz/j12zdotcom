// eslint.config.ts
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginAstro from 'eslint-plugin-astro'
import parserAstro from 'astro-eslint-parser'
import pluginSvelte from 'eslint-plugin-svelte'
import parserSvelte from 'svelte-eslint-parser'
import pluginImport from 'eslint-plugin-import'
import globals from 'globals'

export default [
  // Ignorer des chemins
  {
    ignores: ['node_modules', 'dist', '.astro', 'public', 'astro.config.mjs', 'astro.config.ts'],
  },

  // Recommandations JS de base
  eslint.configs.recommended,

  // Recommandations TypeScript
  ...tseslint.configs.recommended,

  // Recommandations Astro (flat)
  ...pluginAstro.configs['flat/recommended'],

  // Recommandations Svelte (flat)
  ...pluginSvelte.configs['flat/recommended'],

  // Règles et settings du projet (appliqués après les presets pour les surcharger)
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // Utile pour certains cas Astro
        astroHTML: 'readonly',
      },
    },
    plugins: {
      import: pluginImport,
    },
    settings: {
      // Résolution des imports (TypeScript + Node)
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // UI ne doit dépendre ni du domain ni des pages/layouts
            { target: 'src/ui', from: 'src/domain/**' },
            { target: 'src/ui', from: 'src/pages/**' },
            { target: 'src/ui', from: 'src/layouts/**' },

            // Domain ne doit pas dépendre des pages
            { target: 'src/domain', from: 'src/pages/**' },

            // Règles internes au Design System (hiérarchie):
            // atoms ne peut pas importer molecules/organisms
            { target: 'src/ui/atoms', from: 'src/ui/{molecules,organisms}/**' },
            // molecules ne peut pas importer organisms
            { target: 'src/ui/molecules', from: 'src/ui/organisms/**' },

            // Pas d'utilisation de dev utils depuis le reste
            { target: 'src/ui/**', from: 'src/domain/dev/**' },
            { target: 'src/domain/**', from: 'src/domain/dev/**' },
            { target: 'src/pages/**', from: 'src/domain/dev/**' },
          ],
        },
      ],
    },
  },

  // Overrides pour fichiers Astro : parser Astro + TS pour les <script>
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: parserAstro,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.astro'],
      },
    },
  },

  // Overrides pour fichiers Svelte : parser Svelte + TS pour les <script lang="ts">
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: parserSvelte,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
]
