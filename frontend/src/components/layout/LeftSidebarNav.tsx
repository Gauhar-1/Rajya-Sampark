'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { NAV_LINKS, ROLE_PERMISSIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
// import { LogOut, Vote } from 'lucide-react';

export function LeftSidebarNav() {
  const pathname = usePathname();
  const { setPanel, role } = useAuth();

  const checkPanelEntry = (label : string)=>{
     if(label.includes('Panel')){
      setPanel(true);
     }
     else{
      setPanel(false);
     }
  }

 

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="items-center justify-center p-4 hidden md:flex">
      </SidebarHeader>
      <SidebarContent className="p-2 mt-9">
        <SidebarMenu>
          {NAV_LINKS.filter(link => ROLE_PERMISSIONS[role].includes(link.href)).map((link) => (
            <SidebarMenuItem key={link.href} onClick={()=>{
                 checkPanelEntry(link.label);
            }}>
              <Link href={link.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))}
                  tooltip={{ children: link.label, className: "whitespace-nowrap" }}
                  className="justify-start"
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {/* <Button variant="ghost" className="w-full justify-start gap-2">
          <LogOut className="h-5 w-5" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button> */}
      </SidebarFooter>
    </Sidebar>
  );
}
