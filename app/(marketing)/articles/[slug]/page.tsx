import { getPostData, getAllPostSlugs } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

// Define the type for page props, correctly indicating params is a Promise
// and assuming getPostData returns a flat object as per the error message.
type PostData = {
  date: string;
  title: string;
  slug: string;
  content: string;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths;
}

// Corrected: params type is Promise and is awaited.
// Corrected: Accessing title directly on post.
export async function generateMetadata({ params }: PageProps) {
  try {
    const { slug } = await params; // Await the params Promise [3, 4]
    // Await getPostData, and assume it returns PostData structure.
    const post: PostData = await getPostData(slug); // Await the getPostData Promise [User's current query, 77]
    return {
      title: post.title, // Corrected: Access title directly
    };
  } catch (error) {
    return {
      title: 'Post Not Found',
    };
  }
}

// Corrected: params type is Promise and is awaited.
// Corrected: Accessing title and date directly on post.
export default async function Post({ params }: PageProps) {
  let post: PostData;
  try {
    const { slug } = await params; // Await the params Promise [3, 4]
    post = await getPostData(slug); // Await the getPostData Promise [User's current query, 77]
  } catch (error) {
    notFound(); // Use Next.js notFound function for 404 [5, 6]
  }

  return (
    <main className="container mx-auto max-w-3xl py-16 px-6">
      <article className="prose lg:prose-xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 mb-2">
          {post.title} {/* Corrected: Access title directly */}
        </h1>
        <p className="text-lg text-gray-500 mb-8">{post.date}</p> {/* Corrected: Access date directly */}
        <MDXRemote source={post.content} />
      </article>
    </main>
  );
}