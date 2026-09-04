import React from 'react';
import { getMyCard } from "@/Services/card";
import CardDashboardView from '@/components/CardDashboardView';
import Link from 'next/link';

export default async function DashboardPage() {
  const response = await getMyCard();

  if (!response || !response.success) {
    return (
      <main className="font-brand-sans bg-brand-bg text-brand-text min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="font-brand-serif text-3xl mb-4">Access Denied</h1>
          <p className="opacity-60 mb-8">Please log in to view your dashboard.</p>
          <Link href="/login" className="px-6 py-2 bg-brand-primary text-white rounded-full text-sm">
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return <CardDashboardView user={response.data} />;
}
