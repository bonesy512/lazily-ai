import { getSortedPostsData } from '@/lib/content/posts';
import Link from 'next/link';

export default function ArticlesPage() {
  const allPostsData = getSortedPostsData();

  return (
    <main className="container mx-auto max-w-3xl py-16 px-6">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 mb-8">
        Blog
      </h1>
      <ul className="space-y-4">
        {allPostsData.map(({ slug, date, title }) => (
          <li key={slug}>
            <Link href={`/articles/${slug}`}>
              <a className="text-2xl font-bold text-blue-600 hover:underline">
                {title}
              </a>
            </Link>
            <p className="text-lg text-gray-500">{date}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
