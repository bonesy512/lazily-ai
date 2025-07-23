import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
    // This now uses your real Price ID for the $10/month subscription
    const platformAccessPriceId = 'price_1Ro7K7PnNiwcL8wHamerpDyu';

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-foreground">Simple, Transparent Pricing</h1>
                <p className="mt-2 text-lg text-muted-foreground">One simple plan to automate everything.</p>
            </div>

            <Card className="max-w-md mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Lazily.AI Plan</CardTitle>
                    <CardDescription>Pay only for what you use.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center">
                        <p className="text-4xl font-medium">
                            $10 <span className="text-xl font-normal text-muted-foreground">/ month</span>
                        </p>
                        <p className="text-2xl font-medium mt-2">
                            + $5 <span className="text-xl font-normal text-muted-foreground">/ contract</span>
                        </p>
                    </div>

                    <ul className="space-y-4 my-8">
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-foreground">AI-Powered TREC 1-4 Form Automation</span>
                        </li>
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-foreground">Bulk Contract Generation</span>
                        </li>
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-foreground">Unlimited Lead & Property Management</span>
                        </li>
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-foreground">Team Collaboration Features</span>
                        </li>
                    </ul>

                    <form action={checkoutAction}>
                        <input type="hidden" name="priceId" value={platformAccessPriceId} />
                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}