import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Yuji MLBB Top Up',
    short_name: 'Yuji MLBB',
    description: 'Fast and secure Mobile Legends (MLBB) diamond top-up platform.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#060709',
    theme_color: '#060709',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
    ],
  }
}
