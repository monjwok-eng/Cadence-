import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/components/providers/app-provider';
import { AppShell } from '@/components/layout/app-shell';
import { ToastContainer } from '@/components/ui/toast-container';

export const metadata: Metadata = {
  title: 'Cadence — AI Voice Agent Platform',
  description:
    'Create, train, and manage AI voice agents for automated customer phone conversations.',
  openGraph: {
    title: 'Cadence — AI Voice Agent Platform',
    description:
      'Create, train, and manage AI voice agents for automated customer phone conversations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cadence — AI Voice Agent Platform',
    description:
      'Create, train, and manage AI voice agents for automated customer phone conversations.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100"
        suppressHydrationWarning
      >
        <AppProvider>
          <AppShell>{children}</AppShell>
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
