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
      image: z.string(),
      introduction: z.object({
        greeting: z.string(),
        mission: z.string(),
      }),
      values: z.object({
        title: z.string(),
        items: z.array(
          z.object({
            label: z.string(),
            color: z.enum([
              'primary',
              'secondary',
              'accent',
              'success',
              'warning',
              'error',
              'info',
              'neutral',
            ]),
          })
        ),
      }),
      callToAction: z.object({
        title: z.string(),
        content: z.string(),
      }),
    }),
    differences: z.object({
      title: z.string(),
      image: z.string(),
      introduction: z.object({
        main: z.string(),
        secondary: z.string(),
      }),
      strengths: z.object({
        title: z.string(),
        items: z.array(
          z.object({
            icon: z.string(),
            title: z.string(),
            badge: z.string(),
            badgeVariant: z.enum(['primary', 'secondary', 'neutral']),
            description: z.string(),
            color: z.enum([
              'primary',
              'secondary',
              'accent',
              'success',
              'warning',
              'error',
              'info',
              'neutral',
            ]),
          })
        ),
      }),
      testimonial: z.object({
        quote: z.string(),
        author: z.string(),
        stars: z.number(),
      }),
    }),
    story: z.object({
      title: z.string(),
      image: z.string(),
      introduction: z.object({
        frustration: z.string(),
        realization: z.string(),
      }),
      revelations: z.object({
        title: z.string(),
        items: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            color: z.enum([
              'primary',
              'secondary',
              'accent',
              'success',
              'warning',
              'error',
              'info',
              'neutral',
            ]),
          })
        ),
      }),
      evolution: z.object({
        approach: z.string(),
        mission: z.string(),
      }),
      quote: z.object({
        text: z.string(),
        author: z.string(),
      }),
    }),
    credentials: z.object({
      title: z.string(),
      description: z.string(),
      accomplishments: z.array(
        z.object({
          icon: z.string(),
          title: z.string(),
          description: z.string(),
          badge: z.string(),
          badgeVariant: z.enum(['primary', 'secondary', 'neutral']),
          action: z
            .object({
              label: z.string(),
              url: z.string(),
            })
            .optional(),
        })
      ),
      statistics: z.object({
        title: z.string(),
        items: z.array(
          z.object({
            value: z.string(),
            label: z.string(),
            color: z.enum([
              'primary',
              'secondary',
              'accent',
              'success',
              'warning',
              'error',
              'info',
              'neutral',
            ]),
          })
        ),
      }),
      skills: z.object({
        technical: z.object({
          title: z.string(),
          items: z.array(
            z.object({
              label: z.string(),
              color: z.enum([
                'primary',
                'secondary',
                'accent',
                'success',
                'warning',
                'error',
                'info',
                'neutral',
              ]),
            })
          ),
        }),
        human: z.object({
          title: z.string(),
          items: z.array(
            z.object({
              label: z.string(),
              color: z.enum([
                'primary',
                'secondary',
                'accent',
                'success',
                'warning',
                'error',
                'info',
                'neutral',
              ]),
            })
          ),
        }),
      }),
      continuousLearning: z.object({
        title: z.string(),
        description: z.string(),
        badges: z.array(
          z.object({
            label: z.string(),
            variant: z.enum(['primary', 'secondary', 'neutral']),
          })
        ),
        quote: z.object({
          text: z.string(),
          author: z.string(),
        }),
      }),
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
