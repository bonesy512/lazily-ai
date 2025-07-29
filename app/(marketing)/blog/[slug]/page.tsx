import { getPostData, getAllPostSlugs } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const post = await getPostData(params.slug);
    return {
      title: post.title,
    };
  } catch (error) {
    return {
      title: 'Post Not Found',
    };
  }
}

export default async function Post({ params }: { params: { slug: string } }) {
  let post;
  try {
    post = await getPostData(params.slug);
  } catch (error) {
    notFound();
  }

  return (
    <article className="container mx-auto max-w-3xl py-12 px-4">
      <div className="prose dark:prose-invert lg:prose-xl">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">{post.title}</h1>
        <p className="text-muted-foreground text-lg mb-8">{post.date}</p>
        <MDXRemote source={post.content} />
      </div>
    </article>
  );
}