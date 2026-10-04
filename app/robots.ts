import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/admin-panel/', '/dashboard/', '/owner-panel/', '/owner-panal/'],
    },
    sitemap: 'https://yujimlbb.com/sitemap.xml',
  }
}
