// lib/content/posts.ts

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'posts');

type PostData = {
  slug: string;
  title?: string;
  date?: string;
  description?: string;
};

export function getSortedPostsData(): PostData[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, '');

    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // --- DIAGNOSTIC LINE ---
    console.log(`--- PARSING ${fileName} ---`, matterResult);
    // -----------------------

    // Safely access data, providing undefined if not present
    const data = matterResult.data as { [key: string]: any };

    return {
      slug,
      title: data.title,
      date: data.date,
      description: data.description,
    };
  });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0; // Keep original order if dates are missing
  });
}

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        slug: fileName.replace(/\.mdx$/, ''),
      },
    };
  });
}

export async function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const data = matterResult.data as { [key: string]: any };

  return {
    slug,
    content: matterResult.content,
    title: data.title,
    date: data.date,
    description: data.description,
  };
}