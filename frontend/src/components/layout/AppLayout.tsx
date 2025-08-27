import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from './AppHeader';
import { LeftSidebarNav } from './LeftSidebarNav';
import { RightSidebarContent } from './RightSidebarContent';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <div className="flex flex-1 pt-16">
          <LeftSidebarNav />
          <SidebarInset className="flex flex-1 p-2">
              <div className="flex flex-col lg:flex-row gap-1">
                <main className="flex-1  py-6 px-4 sm:px-6 lg:px-8"> 
                  <div className='container mx-auto'>
                  {children}
                  </div>
                </main>
                <aside className="w-80 xl:w-96 flex-shrink-0  hidden lg:block">
                  <RightSidebarContent />
                </aside>
              </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
