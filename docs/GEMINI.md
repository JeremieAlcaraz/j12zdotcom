# Gemini Code Assistant Guide

This guide provides instructions for using the Gemini code assistant with this project.

## Project Overview

This project is a modern showcase site for presenting training and services, built with Astro. It uses a combination of Astro, React, and Svelte components, with Tailwind CSS and DaisyUI for styling.

## Tech Stack

- **Framework:** [Astro](https://astro.build/)
- **UI Components:** [React](https://react.dev/), [Svelte](https://svelte.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [DaisyUI](https://daisyui.com/)
- **Linting:** [ESLint](https://eslint.org/)
- **Formatting:** [Prettier](https://prettier.io/)
- **Package Manager:** [pnpm](https://pnpm.io/)

## Getting Started

### Prerequisites

- **Node.js:** Version 18.0.0 or higher.
- **pnpm:** Version 8.0.0 or higher.

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd site-formations
    ```
3.  Install the dependencies:
    ```bash
    pnpm install
    ```

## Available Scripts

You can run the following scripts using `pnpm run <script-name>`:

- **`dev`**: Starts the development server.
- **`start`**: An alias for `dev`.
- **`build`**: Builds the project for production. This includes image optimization.
- **`preview`**: Serves the production build locally for previewing.
- **`lint`**: Lints the codebase for errors.
- **`lint:fix`**: Lints the codebase and automatically fixes issues.
- **`format`**: Formats the code using Prettier.
- **`format:check`**: Checks for formatting issues without applying changes.
- **`type-check`**: Runs the TypeScript compiler to check for type errors.
- **`img:opt`**: Optimizes images in the `src/assets/raw` directory and outputs them to `src/assets/img_opt`.

## Directory Structure

- **`src/`**: Contains the main source code of the project.
  - **`assets/`**: Static assets like images and fonts.
    - **`raw/`**: Raw, unoptimized images.
    - **`img_opt/`**: Optimized images.
  - **`components/`**: Reusable UI components (Astro, React, Svelte).
  - **`content/`**: Content for the site, managed by Astro's content collections.
  - **`layouts/`**: Base layouts for pages.
  - **`pages/`**: Astro pages, which define the routes of the site.
  - **`styles/`**: Global CSS styles.
- **`public/`**: Files in this directory are served at the root of the site.

## Content Management

To add or modify content, you can edit the Markdown or MDX files in the `src/content/` directory. The content is managed using Astro's content collections, with the schema defined in `src/content/content.ts`.

## Image Optimization

This project uses `sharp-cli` for image optimization. To optimize new images, place them in the `src/assets/raw` directory and run the following command:

```bash
pnpm run img:opt
```

This will generate optimized AVIF, WebP, and PNG images in the `src/assets/img_opt` directory.

## Coding Style

This project uses ESLint for linting and Prettier for code formatting. Please run the following commands before committing your changes to ensure your code adheres to the project's style guidelines:

```bash
pnpm run lint:fix
pnpm run format
```

## Deployment

To build the site for production, run the following command:

```bash
pnpm run build
```

The output will be in the `dist/` directory. You can then deploy this directory to your hosting provider.
