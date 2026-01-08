import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

// Homepage collection schema
const homepageCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/homepage' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
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

const shopCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/shop' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    summary: z.string().optional(),
    type: z.enum(['product', 'service']),
    productType: z.enum(['templates-notion', 'musiques', 'prompts', 'divers']).optional(),
    serviceType: z.enum(['formation', 'coaching', 'ateliers']).optional(),
    categories: z
      .array(z.enum(['notion', 'automatisation', 'ai', 'sante', 'prendre-soin']))
      .default([]),
    price: z.number().nonnegative().default(0),
    currency: z.string().default('€'),
    isNew: z.boolean().default(false),
    cover: z.string(),
    gallery: z.array(z.string()).default([]),
    ctaLabel: z.string().optional(),
    ctaUrl: z.string().optional(),
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

// Now collection schema
const nowCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/now' }),
  schema: z.object({
    lastUpdate: z.date(),
    status: z.enum(['current', 'archived']),

    // Focus principal (Le Gros Rocher)
    focus: z.object({
      emoji: z.string(),
      title: z.string(),
      description: z.string(),
    }),

    // Localisation
    location: z.object({
      emoji: z.string(),
      city: z.string(),
      description: z.string(),
    }),

    // Apprentissages
    learning: z.array(
      z.object({
        emoji: z.string(),
        title: z.string(),
        description: z.string(),
      })
    ).optional(),

    // Ce que j'écoute (avec embeds)
    listening: z.array(
      z.object({
        title: z.string(),
        artist: z.string().optional(),
        embedType: z.enum(['spotify', 'soundcloud', 'youtube', 'custom']),
        embedUrl: z.string(),
        description: z.string().optional(),
      })
    ).optional(),

    // Vie personnelle
    personal: z.array(
      z.object({
        emoji: z.string(),
        title: z.string(),
        description: z.string(),
      })
    ).optional(),

    // Limites (Ce que je ne fais PAS)
    limits: z.array(
      z.object({
        emoji: z.string(),
        title: z.string(),
        description: z.string(),
      })
    ).optional(),
  }),
})

// TIL collection schema
const tilCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/til' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
})

// Export all collections
export const collections = {
  //pages
  homepage: homepageCollection,
  blog: blogCollection,
  shop: shopCollection,
  about: aboutCollection,
  now: nowCollection,
  til: tilCollection,

  //sections
  testimonialSection: testimonialSectionCollection,
}
