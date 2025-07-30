import { getPostData, getAllPostSlugs } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

// Define the type for page props, correctly indicating params is a Promise
type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths;
}

// Ensure generateMetadata is an async function and awaits both params and getPostData
export async function generateMetadata({ params }: PageProps) {
  try {
    const { slug } = await params; // Await the params Promise
    const post = await getPostData(slug); // Await the getPostData Promise
    return {
      title: post.frontmatter.title,
    };
  } catch (error) {
    return {
      title: 'Post Not Found',
    };
  }
}

// Ensure the Post component is an async function and awaits both params and getPostData
export default async function Post({ params }: PageProps) {
  let post;
  try {
    const { slug } = await params; // Await the params Promise
    post = await getPostData(slug); // Await the getPostData Promise
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