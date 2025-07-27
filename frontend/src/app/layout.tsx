
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Civic Connect',
  description: 'Your platform for engaging with local elections and candidates.',
};

// RootLayout cannot be a client component if metadata is exported like this.
// To manage state here for handleCreatePost/Campaign, we'd need to wrap children in a client component,
// or lift state to a context. For now, handlers in LeftSidebarNav are placeholders.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // State management for created posts/campaigns at this level is complex
  // because RootLayout is a Server Component.
  // The handlers in LeftSidebarNav are simplified for this step.
  // A proper solution would involve React Context or a state management library.

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {/* 
            If AppLayout or LeftSidebarNav needed to update HomePage or CampaignPage states,
            we'd need a more robust state management solution (Context API or Zustand/Redux).
            For now, the onPostCreated/onCampaignCreated in LeftSidebarNav are illustrative
            and won't update the actual page lists directly from there.
            The forms themselves will update their respective pages if they are on them.
          */}
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
