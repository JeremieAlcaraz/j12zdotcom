import type { APIRoute } from 'astro'

export const GET: APIRoute = async () => {
  return Response.redirect('/atom', 301)
}
