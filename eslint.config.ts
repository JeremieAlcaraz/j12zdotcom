/**
 * Root ESLint configuration used by the whole project.
 * The imports below are grouped by ecosystem to make the file easier to scan.
 */

// Core ESLint rules
/* eslint-disable import/order -- import groups documented with comments */
import eslint from '@eslint/js'

// TypeScript support
import tseslint from 'typescript-eslint'

// Astro support
import pluginAstro from 'eslint-plugin-astro'
import parserAstro from 'astro-eslint-parser'

// Svelte support
import pluginSvelte from 'eslint-plugin-svelte'
import parserSvelte from 'svelte-eslint-parser'

// Shared utilities
import globals from 'globals'
import pluginImport from 'eslint-plugin-import'

export default tseslint.config(
  // 1. Ignore generated and output directories
  {
    ignores: ['node_modules', 'dist', '.astro', 'public', 'astro.config.mjs'],
  },

  // 2. Base ESLint recommended rules
  eslint.configs.recommended,

  // 3. TypeScript rules with strict type checking
  ...tseslint.configs.strictTypeChecked,

  // 4. Astro recommended configuration
  ...pluginAstro.configs['flat/recommended'],

  // 5. Svelte recommended configuration
  ...pluginSvelte.configs['flat/recommended'],

  // 6. Global options and custom rules
  {
    languageOptions: {
      // Use project tsconfig for type-aware linting
      parserOptions: { project: true },
      // Expose both browser and Node globals
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    // General TypeScript hygiene rules
    rules: {
      // Warn when variables or arguments are declared but not used
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // Discourage the catch-all `any` type
      '@typescript-eslint/no-explicit-any': 'warn',
      // Enforce using `import type` when only types are imported
      '@typescript-eslint/consistent-type-imports': 'error',
      // Ensure promises are properly handled
      '@typescript-eslint/no-floating-promises': 'error',
      // Flag accidental console statements
      'no-console': 'warn',
    },
  },

  // 7. Parser settings for Astro components
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: parserAstro,
      globals: {
        astroHTML: 'readonly',
      },
      parserOptions: {
        parser: tseslint.parser,
        project: true,
        extraFileExtensions: ['.astro'],
      },
    },
  },

  // 8. Parser settings for Svelte components
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: parserSvelte,
      parserOptions: {
        parser: tseslint.parser,
        project: true,
      },
    },
  },

  // 9. Import plugin configuration
  {
    plugins: { import: pluginImport },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // Allow Astro virtual modules while flagging other unresolved imports
      'import/no-unresolved': ['error', { ignore: ['^astro:'] }],
      'import/no-duplicates': 'error',
      // Keep imports sorted and separated by type
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      // Avoid lengthy relative paths like ../../foo
      'import/no-useless-path-segments': 'error',
      // Disallow requiring packages that aren't listed in package.json
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: true },
      ],
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: 'src/components/atoms',
              from: 'src/components/{molecules,organisms,sections,layout}',
            },
            {
              target: 'src/components/molecules',
              from: 'src/components/{organisms,sections,layout}',
            },
            { target: 'src/components/organisms', from: 'src/components/{sections,layout}' },
            { target: 'src/components/sections', from: 'src/components/layout' },
            { target: 'src/components/layout', from: 'src/components/{organisms,sections}' },
            { target: 'src/components/**/*', from: 'src/components/dev' },
          ],
        },
      ],
    },
  }
)
