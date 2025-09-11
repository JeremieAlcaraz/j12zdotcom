// Augment Astro's SVGAttributes to allow a `title` prop on SVG components
// This enables passing a human-readable title to `~icons/*` components.
declare namespace astroHTML.JSX {
  interface SVGAttributes {
    title?: string | null | undefined;
  }
}

