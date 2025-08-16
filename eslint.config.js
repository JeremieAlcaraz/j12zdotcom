import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginAstro from 'eslint-plugin-astro'
import parserAstro from 'astro-eslint-parser'
import pluginSvelte from 'eslint-plugin-svelte'
import parserSvelte from 'svelte-eslint-parser'
import globals from 'globals'
import pluginImport from 'eslint-plugin-import'

export default tseslint.config(
  {
    ignores: ['node_modules', 'dist', '.astro', 'public', 'eslint.config.js', 'astro.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginAstro.configs['flat/recommended'],
  ...pluginSvelte.configs['flat/recommended'],
  {
    // Global settings for all files
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // Settings for Astro components
    files: ['**/*.astro'],
    languageOptions: {
      parser: parserAstro,
      globals: {
        astroHTML: 'readonly',
      },
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.astro'],
      },
    },
  },
  {
    // Settings for Svelte components
    files: ['**/*.svelte'],
    languageOptions: {
      parser: parserSvelte,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    plugins: { import: pluginImport },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
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
