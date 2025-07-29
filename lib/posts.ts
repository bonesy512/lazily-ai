import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'posts');

function getPostSlugs() {
  return fs.readdirSync(postsDirectory).map(fileName => fileName.replace(/\.mdx$/, ''));
}

export function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  return { slug, frontmatter: data, content };
}

export function getSortedPostsData() {
  const slugs = getPostSlugs();
  const allPosts = slugs
    .map(slug => getPostData(slug))
    .sort((post1, post2) => (post1.frontmatter.date > post2.frontmatter.date ? -1 : 1));
  return allPosts;
}

export function getAllPostSlugs() {
  const slugs = getPostSlugs();
  return slugs.map(slug => ({ params: { slug } }));
}