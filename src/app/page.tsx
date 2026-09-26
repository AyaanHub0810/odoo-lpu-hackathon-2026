'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { useUser } from '@clerk/nextjs';

export default function Home() {
  const router = useRouter();
  const { user } = useInventory();
  const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn } = useUser();

  useEffect(() => {
    // If Clerk is still loading, wait
    if (!clerkLoaded) return;

    if (clerkSignedIn || user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [user, clerkLoaded, clerkSignedIn, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080b14]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Entering StockSense WMS...
        </span>
      </div>
    </div>
  );
}
