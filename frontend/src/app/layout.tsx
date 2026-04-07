import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Bungee } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import QueryProvider from '@/providers/QueryProvider';


const bungee = Bungee({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bungee',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RAJYA SAMPARK | LIBERTAD',
  description: 'The Underground Network for Political Accountability. Voice your truth, track the regime.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFDE00',
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${bungee.variable} 
          antialiased 
          bg-[#0A0A0A] 
          text-[#E0E0E0] 
          selection:bg-[#FFDE00] 
          selection:text-black
          overflow-x-hidden
        `}
      >
        

        <AuthProvider>
          <QueryProvider>
            <div className="relative flex flex-col min-h-screen">
              {/* TACTICAL BORDER */}
              <div className="hidden md:block fixed inset-4 border border-white/5 pointer-events-none z-50" />
              
              <AppLayout modal={modal}>
                {children}
              </AppLayout>
            </div>
            
            <Toaster />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}