import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin-panal/', '/owner-panal/', '/api/'],
    },
    sitemap: 'https://yujimlbb.com/sitemap.xml',
  }
}
