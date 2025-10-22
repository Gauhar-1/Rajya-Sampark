
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
  title: 'Rajya Sampark',
  description: 'Engage with your local leaders and elections through Rajya Sampark — a platform to track candidates, promises, events, and civic updates in real time.',
};

export default function RootLayout({
  children,
   modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <AppLayout modal={modal}>
            {children}
            </AppLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
