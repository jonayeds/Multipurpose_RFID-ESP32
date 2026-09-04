import React from 'react';
import { getMyReader } from "@/Services/reader";
import Link from 'next/link';
import ReaderDashboardView from '@/components/ReaderDashboardView';

export default async function ReaderDashboardPage() {
  const response = await getMyReader();

  if (!response || !response.success) {
    return (
      <main className="font-brand-sans bg-brand-bg text-brand-text min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="font-brand-serif text-3xl mb-4">Access Denied</h1>
          <p className="opacity-60 mb-8">Please log in to view your reader dashboard.</p>
          <Link href="/login" className="px-6 py-2 bg-brand-primary text-white rounded-full text-sm">
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return <ReaderDashboardView reader={response.data} />;
}
