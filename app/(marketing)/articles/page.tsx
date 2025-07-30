import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export const metadata = {
  title: 'Articles',
  description: 'Read the latest articles and updates from Lazily.ai.',
};

export default function ArticlesPage() {
  const allPosts = getSortedPostsData();

  return (
    <div className="container mx-auto max-w-3xl py-16 px-6">
      <h1 className="text-4xl font-bold tracking-tight text-gray-800 sm:text-5xl mb-10">
        From the Blog
      </h1>
      <ul className="space-y-8">
        {allPosts.map(({ slug, frontmatter }) => (
          <li key={slug}>
            <Link href={`/articles/${slug}`}>
              <h2 className="text-2xl font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200">
                {frontmatter.title}
              </h2>
            </Link>
            <p className="text-gray-500 mt-2">{frontmatter.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}