'use client';

import Link from 'next/link';
import Image from 'next/image';
import { use, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Home, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher); // `useSWR` is typically for client-side data fetching [1]
  const router = useRouter(); // `useRouter` is a Client Component hook in the App Router [2, 3]

  async function handleSignOut() {
    await signOut(); // This function likely performs data mutation via a Server Action [4]
    mutate('/api/user');
    router.push('/'); // `router.push` enables client-side navigation [3]
  }

  if (!user) {
    // Links displayed for unauthenticated users
    return (
      <>
        {/* NEW: Articles link added here */}
        <Link
          href="/articles"
          className="text-sm font-medium text-foreground/80 hover:text-foreground"
        >
          Articles
        </Link>
        <Link
          href="/pricing"
          className="text-sm font-medium text-foreground/80 hover:text-foreground"
        >
          Pricing
        </Link>
        <Button asChild className="rounded-full" variant="secondary">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </>
    );
  }

  // Dropdown menu for authenticated users
  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n) => n)
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  return (
    // THE FIX IS HERE: Changed z-50 to z-[100] to ensure it's on top of all other content
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/Lazily-Text.png"
            alt="Lazily.AI Logo"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
           <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      {children}
    </section>
  );
}