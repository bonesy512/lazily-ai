import { getPostData, getAllPostSlugs } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths;
}

// Corrected: params type is Promise and is awaited
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params; // Await the params Promise
    const post = getPostData(slug);
    return {
      title: post.frontmatter.title,
    };
  } catch (error) {
    return {
      title: 'Post Not Found',
    };
  }
}

// Corrected: params type is Promise and is awaited
export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  let post;
  try {
    const { slug } = await params; // Await the params Promise
    post = getPostData(slug);
  } catch (error) {
    notFound();
  }

  return (
    <main className="container mx-auto max-w-3xl py-16 px-6">
      <article className="prose lg:prose-xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 mb-2">
          {post.frontmatter.title}
        </h1>
        <p className="text-lg text-gray-500 mb-8">{post.frontmatter.date}</p>
        <MDXRemote source={post.content} />
      </article>
    </main>
  );
}