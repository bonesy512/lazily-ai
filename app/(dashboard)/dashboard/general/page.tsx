'use client';

import { useActionState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { updateAccount } from '@/app/(login)/actions';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ActionState = {
  name?: string;
  error?: string;
  success?: string;
};

function AccountForm({ user }: { user: User | undefined }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Enter your name" defaultValue={user?.name ?? ''} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="Enter your email" defaultValue={user?.email ?? ''} disabled />
          <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input id="phone" name="phone" type="tel" placeholder="Enter your phone number" defaultValue={user?.phone ?? ''} />
      </div>
      
      <div className="space-y-4 pt-4">
        <Label className="font-medium">Marketing Preferences</Label>
        <div className="flex items-start space-x-3">
          <Checkbox id="marketingEmailConsent" name="marketingEmailConsent" defaultChecked={user?.marketingEmailConsent} />
          <div className="grid gap-1.5 leading-none">
            <label htmlFor="marketingEmailConsent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Receive emails from Lazily.AI
            </label>
            <p className="text-sm text-muted-foreground">
              Get notified about new features, special offers, and tips.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Checkbox id="marketingSmsConsent" name="marketingSmsConsent" defaultChecked={user?.marketingSmsConsent}/>
          <div className="grid gap-1.5 leading-none">
            <label htmlFor="marketingSmsConsent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Receive text messages (SMS) from Lazily.AI
            </label>
            <p className="text-sm text-muted-foreground">
              Get occasional updates and alerts. Message and data rates may apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeneralPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(updateAccount, {});
  const { data: user } = useSWR<User>('/api/user', fetcher);

  return (
    <section>
      <h1 className="text-lg lg:text-2xl font-medium mb-6">
        General Settings
      </h1>

      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Update your account details and marketing preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-48 animate-pulse rounded-md bg-card" />}>
              <AccountForm user={user} />
            </Suspense>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex justify-between items-center">
            <div className="text-sm">
              {state.error && <p className="text-destructive">{state.error}</p>}
              {state.success && <p className="text-green-600">{state.success}</p>}
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </section>
  );
}