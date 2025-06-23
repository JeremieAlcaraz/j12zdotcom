import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

// Homepage collection schema
const homepageCollection = defineCollection({
  loader: glob({ pattern: '**/-*.{md,mdx}', base: 'src/content/homepage' }),
  schema: z.object({
    banner: z.object({
      title: z.string(),
      content: z.string(),
      image: z.string(),
      button: z.object({
        enable: z.boolean(),
        label: z.string(),
        link: z.string(),
      }),
    }),
  }),
});

// Export only homepage collection
export const collections = {
  homepage: homepageCollection,
};
