import { MetadataRoute } from 'next'

const BASE_URL = 'https://yujimlbb.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const routes = [
    '',
    '/games',
    '/leaderboard',
    '/contact',
    '/about',
    '/privacy-policy',
    '/terms-and-conditions',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    // Dynamic game routes
    const response = await fetch(`${BASE_URL}/api/games`, { next: { revalidate: 3600 } })
    const data = await response.json()
    const games = data?.data?.games || []

    const gameUrls = games.map((game: any) => ({
      url: `${BASE_URL}/games/${game.gameSlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...routes, ...gameUrls]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return routes
  }
}
