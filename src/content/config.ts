import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

// Homepage collection schema
const homepageCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/homepage' }),
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
})

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
})
const testimonialSectionCollection = defineCollection({
  loader: glob({
    pattern: 'testimonial.{md,mdx}',
    base: 'src/content/sections',
  }),
  schema: z.object({
    enable: z.boolean(),
    title: z.string(),
    description: z.string(),
    testimonials: z.array(
      z.object({
        name: z.string(),
        avatar: z.string(),
        designation: z.string(),
        content: z.string(),
      })
    ),
  }),
})
// About collection schema
const aboutCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/about' }),
  schema: z.object({
    presentation: z.object({
      title: z.string(),
      content: z.string(),
      image: z.string(),
    }),
    story: z.object({
      title: z.string(),
      content: z.string(),
      image: z.string(),
    }),
    differences: z.object({
      title: z.string(),
      content: z.string(),
      image: z.string(),
    }),
    credentials: z.object({
      title: z.string(),
      content: z.string(),
      image: z.string().optional(),
    }),
  }),
})

// Export all collections
export const collections = {
  //pages
  homepage: homepageCollection,
  blog: blogCollection,
  about: aboutCollection,

  //sections
  testimonialSection: testimonialSectionCollection,
}
