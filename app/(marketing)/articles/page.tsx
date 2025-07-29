import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export const metadata = {
  title: 'Articles',
  description: 'Read the latest articles and updates from Lazily.ai.',
};

export default function ArticlesPage() {
  const allPosts = getSortedPostsData();

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Articles</h1>
      <ul className="space-y-6">
        {allPosts.map(({ slug, frontmatter }) => (
          <li key={slug}>
            {/* Ensure this link points to /articles/ */}
            <Link href={`/articles/${slug}`}>
              <h2 className="text-2xl font-semibold text-blue-600 hover:underline">
                {frontmatter.title}
              </h2>
            </Link>
            <p className="text-muted-foreground mt-1">{frontmatter.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}