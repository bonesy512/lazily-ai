import { Button } from '@/components/ui/button';
import { ArrowRight, Search, FileText, Workflow } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-foreground tracking-tight sm:text-5xl md:text-6xl">
                Stop Grinding.
                <span className="block text-primary">Start Closing.</span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Lazily.AI uses artificial intelligence to find off-market properties, manage leads, and automate contracts—giving you an unfair advantage.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Button
                  size="lg"
                  asChild
                  className="text-lg rounded-full"
                >
                  <Link href="/sign-up">
                    Get Started for Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-6 flex justify-center">
              <Image 
                src="/sloth.png"
                alt="Lazily.AI Mascot"
                width={400}
                height={400}
                priority={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-foreground">The Effortless Deal Engine</h2>
             <p className="mt-2 text-lg text-muted-foreground">Everything you need to close more deals with less work.</p>
          </div>
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Feature 1 */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/20 text-primary">
                <Search className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-foreground">
                  AI-Powered Lead Generation
                </h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Discover undervalued, off-market properties and motivated sellers with our intelligent data analysis.
                </p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/20 text-primary">
                <Workflow className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-foreground">
                  Streamlined Deal Flow
                </h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Manage your leads, track communications, and move deals through your pipeline with our intuitive interface.
                </p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/20 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-foreground">
                  One-Click Contracts
                </h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Generate accurate, compliant TREC 1-4 contracts instantly. Eliminate errors and save hours of paperwork.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
             <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Ready to close deals lazily?
             </h2>
              <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
                Get started today with a free trial. No credit card required.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
                <Button
                  size="lg"
                  asChild
                  className="text-lg rounded-full"
                >
                  <Link href="/sign-up">
                    Claim Your Free Trial
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Link>
                </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}