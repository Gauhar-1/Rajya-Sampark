'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useRef, useLayoutEffect, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import api from '@/lib/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NewspaperPage from './newsPage';
import { Loader2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function FeedList() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // The trigger for fetching the next page
  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '400px', // Start fetching slightly before the user hits the bottom
  });

  const { 
    data, 
    status, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get(`/post?page=${pageParam}&limit=10`);
      return res.data.data || res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Assuming your API returns an array. If it returns 10 items, assume there's a next page.
      // You should adjust this based on your actual backend pagination response (e.g., lastPage.hasNextPage)
      return lastPage?.allFeed?.length === 10 ? allPages.length + 1 : undefined;
    },
  });

  // 1. Fetch Next Page Trigger
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 2. GSAP Animation & Refresh Logic
  useLayoutEffect(() => {
    if (status === 'success') {
      let ctx = gsap.context(() => {
        const pages = gsap.utils.toArray('.newspaper-page');
        
        pages.forEach((page: any) => {
          // Check if it already has a ScrollTrigger to avoid duplicate animations on re-renders
          if (!ScrollTrigger.getById(page.id)) {
            gsap.fromTo(page, 
              { rotateX: 20, y: 100, opacity: 0 },
              {
                rotateX: 0, y: 0, opacity: 1,
                scrollTrigger: {
                  id: page.id, // Assign an ID to track it
                  trigger: page,
                  start: "top 85%",
                  end: "top 25%",
                  scrub: true,
                }
              }
            );
          }
        });
      }, containerRef);

      // CRITICAL: Tell GSAP to recalculate positions because React just injected new heights into the DOM
      // We use a tiny timeout to ensure the browser has finished painting the new nodes.
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);

      return () => {
        clearTimeout(timer);
        ctx.revert();
      };
    }
  }, [status, data]); // Re-run this effect when new data is injected

  // Initial Full-Screen Loader
  if (status === 'pending') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050505]">
        <div className="w-16 h-16 border-t-2 border-amber-500 rounded-full animate-spin mb-6" />
        <div className="font-mono text-amber-500 animate-pulse uppercase tracking-[0.5em] text-xs">
          Compiling Edition...
        </div>
      </div>
    );
  }

  const feedItems = data?.pages.flatMap((page: any) => page.allFeed) || [];

  return (
    <div ref={containerRef} className="flex flex-col items-center">
      
      {/* The Map of Newspaper Pages */}
      {feedItems.map((item, index) => (
        <section 
          key={item._id} 
          id={`page-${item._id}`} // ID needed for GSAP duplicate checking
          className="newspaper-page w-full min-h-screen flex items-center justify-center py-20 border-b-8 border-white/5 relative"
        >
          <NewspaperPage item={item} index={index} />
        </section>
      ))}

      {/* Infinite Scroll Intersection Target */}
      <div 
        ref={loadMoreRef} 
        className="w-full h-40 flex flex-col items-center justify-center"
      >
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-4 opacity-50">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/50">
              Printing Next Edition...
            </span>
          </div>
        ) : hasNextPage ? (
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping opacity-50" />
        ) : (
          <div className="py-12 flex flex-col items-center opacity-30">
            <div className="w-12 h-1 bg-white mb-2" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
              End of Print
            </span>
          </div>
        )}
      </div>

    </div>
  );
}