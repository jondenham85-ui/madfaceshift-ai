import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
      {
              url: 'https://alluring-magic-production.up.railway.app',
              lastModified: new Date(),
              changeFrequency: 'weekly',
              priority: 1,
      },
      {
              url: 'https://alluring-magic-production.up.railway.app/pricing',
              lastModified: new Date(),
              changeFrequency: 'monthly',
              priority: 0.8,
      },
        ]
}    
