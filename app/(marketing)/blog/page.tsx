import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export const metadata = {
  title: 'Blog',
  description: 'Read the latest articles and updates from Lazily.ai.',
};

export default function Blog() {
  const allPosts = getSortedPostsData();

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <ul className="space-y-6">
        {allPosts.map(({ slug, date, title }) => (
          <li key={slug}>
            <Link href={`/blog/${slug}`}>
              <h2 className="text-2xl font-semibold text-blue-600 hover:underline">
                {title}
              </h2>
            </Link>
            <p className="text-muted-foreground mt-1">{date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}