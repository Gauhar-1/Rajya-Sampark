import type { LucideIcon } from 'lucide-react';
import { Home, Users, CalendarDays, FileText, Search, Vote, HandHeart, LayoutDashboard, ShieldCheck, ListTodo  } from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_LINKS: NavLink[] = [
 { href: '/', label: 'Home (Feed)', icon: Home },
  { href: '/candidates', label: 'Candidate Directory', icon: Users },
  { href: '/timeline', label: 'Election Timeline', icon: CalendarDays },
  { href: '/manifesto-summarizer', label: 'Manifesto Summaries', icon: FileText },
  { href: '/campaigns', label: 'Campaign Discovery', icon: Search },
  { href: '/volunteer-signup', label: 'Volunteer Signup', icon: HandHeart },
  { href: '/candidate-dashboard', label: 'Candidate Panel', icon: LayoutDashboard },
  { href: '/volunteer-dashboard', label: 'Volunteer Panel', icon: ListTodo },
  { href: '/admin', label: 'Admin Panel', icon: ShieldCheck },
];

export const APP_NAME = 'RajyaSampark';
export const APP_ICON = Vote;

export const INTEREST_AREAS = [
  { id: 'canvassing', label: 'Canvassing (Door-to-door)' },
  { id: 'phone_banking', label: 'Phone Banking' },
  { id: 'event_support', label: 'Event Support & Logistics' },
  { id: 'data_entry', label: 'Data Entry & Admin Tasks' },
  { id: 'social_media', label: 'Social Media & Digital Outreach' },
  { id: 'other', label: 'Other (Please specify in message)' },
];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ANONYMOUS: ["/"],
  VOTER: ["/", "/candidates",'/timeline' , '/manifesto-summarizer', '/campaigns' ,'/volunteer-signup'],
  VOLUNTEER: ["/", "/candidates",'/timeline' , '/manifesto-summarizer', '/campaigns' ,'/volunteer-dashboard'],
  CANDIDATE: ["/", "/candidates",'/timeline' , '/manifesto-summarizer', '/campaigns' ,'/candidate-dashboard'],
  ADMIN: ["/", "/candidates",'/timeline' , '/manifesto-summarizer', '/campaigns' ,'/volunteer-signup', '/volunteer-dashboard','/candidate-dashboard','/admin' ],
}