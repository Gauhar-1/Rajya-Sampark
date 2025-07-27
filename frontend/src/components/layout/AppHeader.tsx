
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Menu, User, Vote } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HideIfAuth } from '../auth/RequiredAuth';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const { user, logout, isLoading, role } = useAuth(); 
   const router = useRouter();

  const getUserInitials = (name?: string, email?: string | null) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length -1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'CC';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 px-4 shadow-sm backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Vote className="h-7 w-7" />
          <span>CivicConnect</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  {user.photoURL && <AvatarImage src={user.photoURL} alt={user.name || 'User Avatar'} data-ai-hint="user avatar" />}
                  <AvatarFallback>{getUserInitials(user.name, user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email || user.phone || 'No contact info'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">Role: {role.toLowerCase()}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { router.push('/profile') }}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <HideIfAuth> 
            <Link href="/login" >
              <Button variant="outline">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          </HideIfAuth>
        )}
      </div>
    </header>
  );
}
