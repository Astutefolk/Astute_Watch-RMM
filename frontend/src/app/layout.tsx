'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { Navigation } from '@/components/NavigationEnhanced';
import { ThemeProvider } from '@/lib/theme';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>DATTO RMM - Remote Monitoring & Management</title>
        <meta name="description" content="Professional Remote Monitoring and Management platform for IT teams" />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors">
        <ThemeProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center text-slate-600 dark:text-slate-400 text-sm">
                <p>&copy; 2026 DATTO RMM. All rights reserved. | Enterprise Remote Monitoring & Management</p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
