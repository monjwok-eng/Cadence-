'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useApp } from '@/components/providers/app-provider';

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { theme, toggleTheme } = useApp();

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-6 dark:border-neutral-800 dark:bg-neutral-950">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-neutral-900 dark:text-neutral-100 whitespace-nowrap shrink-0"
        >
          <svg
            className="h-6 w-7 text-neutral-900 dark:text-white"
            viewBox="0 0 32 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M5 12.5C5 6.5 11 3.5 19.5 3.5C24.5 3.5 27.5 6 27.5 9.2C27.5 12.1 24.2 13.8 19.5 13.8C14.2 13.8 10.2 12.2 6.2 14.2C5.4 14.6 5 13.8 5 12.5Z"
              fill="currentColor"
            />
            <path
              d="M27 15.5C27 21.5 21 24.5 12.5 24.5C7.5 24.5 4.5 22 4.5 18.8C4.5 15.9 7.8 14.2 12.5 14.2C17.8 14.2 21.8 15.8 25.8 13.8C26.6 13.4 27 14.2 27 15.5Z"
              fill="currentColor"
            />
          </svg>
          <span className="font-display text-base font-semibold tracking-tight">
            Cadence
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
