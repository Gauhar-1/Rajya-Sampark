'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_LINKS, ROLE_PERMISSIONS } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { HideLeftSideBar } from '../auth/RequiredAuth';
import { Power } from 'lucide-react';

export function LeftSidebarNav() {
  const pathname = usePathname();
  const { setPanel, role, logout } = useAuth();

  const checkPanelEntry = (label: string) => {
    if (label.includes('Panel')) {
      setPanel(true);
    } else {
      setPanel(false);
    }
  };

  // If role is undefined, default to 'voter' to prevent crashes during load
  const currentRole = role || 'voter';
  const permittedLinks = NAV_LINKS.filter(link => 
    ROLE_PERMISSIONS[currentRole]?.includes(link.href)
  );

  return (
    <HideLeftSideBar>
      {/* Notice: We don't need a wrapper <div> with fixed height/width here.
        The layout positioning is handled by the parent in AppLayout.tsx.
        This component just renders the flex-column of links.
      */}
      <nav className="flex flex-col h-full justify-between">
        
        {/* Main Navigation Links */}
        <div className="flex flex-col gap-2 mt-8">
          {permittedLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => checkPanelEntry(link.label)}
                className={`
                  group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300
                  ${isActive 
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]" 
                    : "text-white/50 border border-transparent hover:bg-white/5 hover:text-white hover:border-white/10"
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                  ${isActive ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-black/50 group-hover:bg-white/10"}
                `}>
                  <link.icon className="h-5 w-5" />
                </div>
                <span className="font-bold uppercase tracking-wider text-sm">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Footer: User Actions / Logout */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <button 
            onClick={logout}
            className="w-full group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 text-white/50 hover:text-red-500"
          >
            <div className="w-10 h-10 rounded-xl bg-black/50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-black transition-colors">
              <Power className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold uppercase tracking-wider">Sign Out</p>
              <p className="text-[10px] font-mono text-white/30 group-hover:text-red-500/50 uppercase tracking-widest">Terminate Session</p>
            </div>
          </button>
        </div>

      </nav>
    </HideLeftSideBar>
  );
}