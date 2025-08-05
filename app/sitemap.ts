import { MetadataRoute } from 'next';
import { getSortedPostsData } from '@/lib/content/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://lazily.ai';

  // Get all posts
  const posts = getSortedPostsData();

  // Create sitemap entries for each article
  const articleRoutes = posts.map((post) => {
    let lastModifiedDate: Date;

    // Validate if post.date is a valid string and can be parsed into a Date
    if (typeof post.date === 'string' && post.date.trim() !== '') {
      const parsedDate = new Date(post.date);
      // Check if the parsed date is actually valid (not "Invalid Date")
      if (!isNaN(parsedDate.getTime())) { // getTime() returns NaN for an invalid Date object
        lastModifiedDate = parsedDate;
      } else {
        // Fallback for unparsable but non-empty strings
        console.warn(`Invalid date format for post slug: ${post.slug}. Date string: "${post.date}". Using current date as fallback.`);
        lastModifiedDate = new Date();
      }
    } else {
      // Fallback for empty, null, or undefined dates
      console.warn(`Missing or empty date for post slug: ${post.slug}. Using current date as fallback.`);
      lastModifiedDate = new Date();
    }

    return {
      url: `${siteUrl}/articles/${post.slug}`,
      lastModified: lastModifiedDate,
      changeFrequency: 'monthly' as 'monthly',
      priority: 0.8,
    };
  });

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