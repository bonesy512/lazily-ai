import { MetadataRoute } from 'next';
import { getSortedPostsData } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://lazily.ai';

  // Get all posts
  const posts = getSortedPostsData();

  // Create sitemap entries for each article
  const articleRoutes = posts.map((post) => ({
    url: `${siteUrl}/articles/${post.slug}`,
    // CORRECTED: Access 'date' directly from 'post' as per the TypeScript error message's type suggestion
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as 'monthly',
    priority: 0.8,
  }));

  // Define your other static routes
  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly' as 'yearly',
      priority: 1,
    },
    {
      url: `${siteUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/articles`, // The main articles page
      lastModified: new Date(),
      changeFrequency: 'weekly' as 'weekly',
      priority: 0.9,
    },
  ];

  return [...staticRoutes, ...articleRoutes];
}