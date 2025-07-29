import { getPostData, getAllPostSlugs } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths;
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const post = getPostData(params.slug);
    return {
      title: post.frontmatter.title,
    };
  } catch (error) {
    return {
      title: 'Post Not Found',
    };
  }
}

export default function Post({ params }: { params: { slug: string } }) {
  let post;
  try {
    post = getPostData(params.slug);
  } catch (error) {
    notFound();
  }

  return (
    <article className="container mx-auto max-w-3xl py-12 px-4">
      <div className="prose dark:prose-invert lg:prose-xl">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          {post.frontmatter.title}
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          {post.frontmatter.date}
        </p>
        <MDXRemote source={post.content} />
      </div>
    </article>
  );
}