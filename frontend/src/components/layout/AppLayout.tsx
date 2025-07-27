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
          <SidebarInset className="flex-1 overflow-y-auto">
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row gap-6">
                <main className="flex-1 min-w-0"> 
                  {children}
                </main>
                <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
                  <RightSidebarContent />
                </aside>
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
