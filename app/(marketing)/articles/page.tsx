// app/(marketing)/articles/page.tsx

import { getSortedPostsData } from '@/lib/content/posts';
import Link from 'next/link';

export default function ArticlesPage() {
  const allPostsData = getSortedPostsData();

  return (
    <main className="bg-background w-full">
      <div className="container mx-auto max-w-5xl py-12 sm:py-16 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            From the Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Insights on real estate investing, automation, and the Texas market.
          </p>
        </div>

        {/* Responsive grid for the article cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {allPostsData.map(({ slug, date, title, description }) => (
            <Link
              key={slug}
              href={`/articles/${slug}`}
              className="group block rounded-xl border bg-card text-card-foreground shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-2">
                  {/*
                    CORRECTED CODE:
                    This now checks if 'date' exists before trying to format it.
                    If it doesn't, it displays a fallback message.
                  */}
                  {date
                    ? new Date(date.replace(/-/g, '/')).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Date not available'}
                </p>
                <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {title || 'Untitled Post'}
                </h2>
                <p className="text-base text-muted-foreground line-clamp-3">
                  {description || 'No description provided.'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}