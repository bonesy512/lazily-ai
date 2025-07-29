// app/(marketing)/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { MDXRemote } from 'next-mdx-remote/rsc'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const post = getPostBySlug(params.slug)
    if (!post) {
      return { title: 'Post Not Found' }
    }
    return { title: post.frontmatter.title }
  } catch (error) {
    return { title: 'Post Not Found' }
  }
}

export default function Post({ params }: { params: { slug: string } }) {
  let post
  try {
    post = getPostBySlug(params.slug)
  } catch (error) {
    notFound()
  }

  return (
    <main>
      <article className="prose dark:prose-invert lg:prose-xl mx-auto py-12 px-4">
        <h1>{post.frontmatter.title}</h1>
        <MDXRemote source={post.content} />
      </article>
    </main>
  )
}