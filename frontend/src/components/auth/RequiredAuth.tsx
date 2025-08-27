
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Role } from '@/types';
import { Loader2 } from 'lucide-react';

interface RequiredAuthProps {
  children: ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
}

export function RequiredAuth({ children, allowedRoles, redirectTo = '/login' }: RequiredAuthProps) {
  const { user, role, setPanel, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  

  if(!allowedRoles.includes(role)){
    // router.push('/');
     return <>UnAuthorized........</>
  }


  return <>{children}</>;
}

export function HideIfAuth({ children }: { children: ReactNode }) {
  const { user, isLoading, role, panel } = useAuth();

  if (isLoading) {
    return null; 
  }

  // If login is disabled, user is null, so this will show children.
  if (user) {
    return null;
  }

  if(panel){
    return null;
  }

  return <>{children}</>;
}
export function HideRightSideBar({ children }: { children: ReactNode }) {
  const { user, isLoading, role, panel } = useAuth();

  if (isLoading) {
    return null; 
  }

  // If login is disabled, user is null, so this will show children.
  if (!user) {
    return null;
  }

  if(panel){
    return null;
  }

  return <>{children}</>;
}

export function ShowIfAuth({ children, roles }: { children: ReactNode, roles?: Role[] }) {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return null; 
  }

  // If login is disabled, user is null, so this will show nothing.
  if (!user) {
    return null;
  }
  
  if (roles && !roles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
