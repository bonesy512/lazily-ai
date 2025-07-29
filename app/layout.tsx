import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

// --- SEO OPTIMIZED METADATA ---
// This section has been updated to align with the SEO strategy.
export const metadata: Metadata = {
  title: {
    template: '%s | Lazily.AI',
    default: 'Lazily.ai: The Effortless TREC Contract Engine', // Optimized Title
  },
  description: 'Stop spending hours on paperwork. Lazily.ai uses AI to generate hundreds of compliant TREC 1-4 contracts from a single CSV. Effortlessly Done.', // Optimized Description
  openGraph: {
    title: 'Lazily.ai: The Effortless TREC Contract Engine', // Consistent OG Title
    description: 'Stop spending hours on paperwork. Lazily.ai uses AI to generate hundreds of compliant TREC 1-4 contracts from a single CSV. Effortlessly Done.', // Consistent OG Description
    url: 'https://lazily.ai',
    siteName: 'Lazily.AI',
    images: [
      {
        url: 'https://lazily.ai/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lazily.ai: The Effortless TREC Contract Engine', // Consistent Twitter Title
    description: 'Stop spending hours on paperwork. Lazily.ai uses AI to generate hundreds of compliant TREC 1-4 contracts from a single CSV. Effortlessly Done.', // Consistent Twitter Description
    images: ['https://lazily.ai/twitter-image.png'],
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
