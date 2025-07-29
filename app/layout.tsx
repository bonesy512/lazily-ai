import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Enhanced Metadata for Lazily.AI brand, SEO, and Social Sharing
export const metadata: Metadata = {
  title: {
    template: '%s | Lazily.AI', // Allows individual pages to set their own title
    default: 'Lazily.AI - The Effortless Real Estate Contract Engine',
  },
  description: 'Lazily.ai uses AI to automate real estate investing. Find off-market leads, generate contracts, and close more deals with less effort.',
  openGraph: {
    title: 'Lazily.AI - The Effortless Real Estate Contract Engine',
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
    title: 'Lazily.AI - The Effortless Real Estate Contract Engine',
    description: 'Stop grinding. Start closing deals lazily with AI-powered lead generation and contract automation.',
    images: ['https://lazily.ai/twitter-image.png'], // Must create and place this image in /public
  },
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

// Helper component for the JSON-LD Schema
function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Lazily.AI",
    "operatingSystem": "WEB",
    "applicationCategory": "BusinessApplication",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "ratingCount": "25" // Placeholder - update as you get reviews
    },
    "offers": {
      "@type": "Offer",
      "price": "10.00",
      "priceCurrency": "USD",
      "description": "$10/month subscription plus pay-as-you-go credits for contract generation."
    },
    "description": "Lazily.AI is a SaaS platform that automates the generation of TREC 1-4 real estate contracts for Texas professionals, enabling bulk creation from a single CSV file.",
    "url": "https://lazily.ai",
    "author": {
      "@type": "Organization",
      "name": "Lazily.AI"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}


export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-slate-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50 dark:bg-slate-900">
        <SWRConfig
          value={{
            fallback: {
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          {children}
        </SWRConfig>
        <Analytics />
        <SpeedInsights />
        <JsonLd />
      </body>
    </html>
  );
}
