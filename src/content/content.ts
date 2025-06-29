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

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/blog' }),
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    date: z.date(),
    image: z.string().optional(),
    author: z.string().default('Admin'),
    categories: z.array(z.string()).default(['others']),
    tags: z.array(z.string()).default(['others']),
    draft: z.boolean().optional(),
  }),
});

// Export all collections
export const collections = {
  homepage: homepageCollection,
  blog: blogCollection,
};
