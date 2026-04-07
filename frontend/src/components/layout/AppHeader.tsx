'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User, LogOut, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const { user, logout, isLoading, role } = useAuth(); 
  const router = useRouter();

  const getUserInitials = (name?: string, email?: string | null) => {
    if (name) {
      const parts = name.split(' ');
      return parts.length > 1 
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
        : name.substring(0, 2).toUpperCase();
    }
    return email ? email.substring(0, 2).toUpperCase() : '??';
  };

  return (
    // Note: No fixed width, backgrounds, or borders here. 
    // The parent div in AppLayout.tsx handles the glassmorphism pill shape.
    <div className="flex items-center justify-between gap-6 w-full max-w-[600px] py-1">
      
      {/* 1. GLOBAL SEARCH */}
      <div className="flex items-center gap-3 text-white/50 w-64 md:w-80 group">
        <Search className="w-4 h-4 group-focus-within:text-amber-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search local issues, campaigns..." 
          className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30 w-full font-medium" 
        />
      </div>

      {/* VERTICAL DIVIDER */}
      <div className="w-[1px] h-6 bg-white/10 hidden sm:block" />

      {/* 2. USER CONTROLS */}
      <div className="flex items-center gap-4">
        
        {/* Role Badge (Hidden on very small screens) */}
        {user && role && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <ShieldCheck className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">{role}</span>
          </div>
        )}

        {isLoading ? (
          <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative group rounded-full outline-none ring-offset-2 ring-offset-black focus-visible:ring-2 focus-visible:ring-amber-500">
                <Avatar className="h-8 w-8 border border-white/10 group-hover:border-amber-500/50 transition-colors shadow-lg">
                  {user.photoURL && <AvatarImage src={user.photoURL} className="object-cover" />}
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-700 text-black font-bold text-xs">
                    {getUserInitials(user.name, user.email)}
                  </AvatarFallback>
                </Avatar>
                {/* Active Indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-[#080808]" />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              className="w-64 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-2 shadow-2xl" 
              align="end" 
              sideOffset={12}
            >
              <DropdownMenuLabel className="p-3">
                <div className="font-bold text-base text-white">{user.name || 'Citizen'}</div>
                <div className="text-xs font-medium text-white/50 mt-0.5 truncate">{user.email}</div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator className="bg-white/10 mx-2" />
              
              <div className="p-1 space-y-1">
                <DropdownMenuItem 
                  onClick={() => router.push('/profile')} 
                  className="p-3 focus:bg-white/5 focus:text-white rounded-xl cursor-pointer transition-colors"
                >
                  <User className="mr-3 h-4 w-4 text-white/50" />
                  <span className="font-medium text-sm">My Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => router.push('/settings')} 
                  className="p-3 focus:bg-white/5 focus:text-white rounded-xl cursor-pointer transition-colors"
                >
                  <Settings className="mr-3 h-4 w-4 text-white/50" />
                  <span className="font-medium text-sm">Account Settings</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-white/10 mx-2" />
              
              <div className="p-1">
                <DropdownMenuItem 
                  onClick={logout} 
                  className="p-3 focus:bg-red-500/10 focus:text-red-500 rounded-xl cursor-pointer text-white/70 transition-colors group"
                >
                  <LogOut className="mr-3 h-4 w-4 text-white/50 group-focus:text-red-500" />
                  <span className="font-medium text-sm">Sign Out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <button className="px-5 py-2 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-full hover:bg-white transition-colors shadow-lg shadow-amber-500/20">
              Log In
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}