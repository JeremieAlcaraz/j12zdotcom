import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginAstro from "eslint-plugin-astro";
import parserAstro from "astro-eslint-parser";
import pluginSvelte from "eslint-plugin-svelte";
import parserSvelte from "svelte-eslint-parser";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "node_modules",
      "dist",
      ".astro",
      "public",
      "eslint.config.js",
      "astro.config.mjs",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...pluginAstro.configs["flat/recommended"],
  ...pluginSvelte.configs["flat/recommended"],
  {
    // Global settings for all files
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    // Settings for TypeScript files
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Settings for Astro components
    files: ["**/*.astro"],
    languageOptions: {
      parser: parserAstro,
      globals: {
        astroHTML: "readonly",
      },
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".astro"],
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Settings for Svelte components
    files: ["**/*.svelte"],
    languageOptions: {
      parser: parserSvelte,
      parserOptions: {
        parser: tseslint.parser,
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);