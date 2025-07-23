import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

// Enhanced Metadata for Lazily.AI brand, SEO, and Social Sharing
export const metadata: Metadata = {
  title: {
    template: '%s | Lazily.AI', // Allows individual pages to set their own title
    default: 'Lazily.AI - The Effortless Real Estate Deal Engine',
  },
  description: 'Lazily.ai uses AI to automate real estate investing. Find off-market leads, generate contracts, and close more deals with less effort.',
  openGraph: {
    title: 'Lazily.AI - The Effortless Real Estate Deal Engine',
    description: 'Stop grinding. Start closing deals lazily with AI-powered lead generation and contract automation.',
    url: 'https://lazily.ai',
    siteName: 'Lazily.AI',
    images: [
      {
        url: 'https://lazily.ai/og-image.png', // Must create and place this image in /public
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lazily.AI - The Effortless Real Estate Deal Engine',
    description: 'Stop grinding. Start closing deals lazily with AI-powered lead generation and contract automation.',
    images: ['https://lazily.ai/twitter-image.png'], // Must create and place this image in /public
  },
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // Subtle theme adjustment from generic gray to a more modern slate for dark mode
      className={`bg-white dark:bg-slate-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50 dark:bg-slate-900">
        <SWRConfig
          value={{
            fallback: {
              // This pre-fetches user and team data for logged-in users, improving performance.
              // No changes needed here.
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}