'use client';

import { useRef, useLayoutEffect, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteFeed } from '@/app/feed/hook/usePost'; 
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Loader2, CloudSun, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import NewspaperArticle from './newsPaperArticle'; 

gsap.registerPlugin(ScrollTrigger);

export default function FeedList() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '800px', 
  });

  const { 
    data, 
    status, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteFeed();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ==========================================
  // DATA CHUNKING
  // ==========================================
  const broadsheets = useMemo(() => {
    const rawFeed = data?.pages.flatMap((page: any) => page) || [];
    const chunks = [];
    for (let i = 0; i < rawFeed.length; i += 4) {
      chunks.push(rawFeed.slice(i, i + 4));
    }
    return chunks;
  }, [data]);

  // ==========================================
  // FIX 1: THE TRIPLE-TAP REFRESH
  // Forces GSAP to remeasure the page after heavy network images load
  // ==========================================
  useEffect(() => {
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 100);
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 750);
    const t3 = setTimeout(() => ScrollTrigger.refresh(), 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [broadsheets.length]); 

  // ==========================================
  // FIX 2: DEBOUNCED GEOMETRY OBSERVER
  // ==========================================
  useEffect(() => {
    if (!containerRef.current) return;

    let refreshTimeout: ReturnType<typeof setTimeout>;

    const observer = new ResizeObserver(() => {
      clearTimeout(refreshTimeout);
      // Increased from 20ms to 250ms. We MUST wait for the browser 
      // to finish its layout shifting before running GSAP math.
      refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 250); 
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      clearTimeout(refreshTimeout);
    };
  }, []);

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505]">
        <Loader2 className="w-12 h-12 text-white animate-spin mb-6" />
        <div className="font-serif text-white animate-pulse uppercase tracking-[0.3em] text-xs">
          Aligning Typeset...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center bg-[#050505] text-white selection:bg-amber-500 selection:text-black">
      
      {broadsheets.map((chunk, index) => (
        <Broadsheet key={`page-${index}`} items={chunk} pageNumber={index + 1} />
      ))}

      {/* The Footer Loader */}
      <div ref={loadMoreRef} className="w-full max-w-[1400px] h-48 flex flex-col items-center justify-center border-t-8 border-white mt-12 mb-32">
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50">Printing Next Edition...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-white flex items-center justify-center rounded-full mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Press Concluded</span>
          </div>
        )}
      </div>

    </div>
  );
}

// ==========================================
// THE BROADSHEET COMPONENT
// ==========================================
function Broadsheet({ items, pageNumber }: { items: any[], pageNumber: number }) {
  const currentDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const pageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(pageRef.current, 
        { opacity: 0, scale: 0.98, filter: 'grayscale(100%) blur(4px)' },
        {
          opacity: 1, 
          scale: 1, 
          filter: 'grayscale(0%) blur(0px)',
          duration: 1.2,
          ease: "power3.out",
          clearProps: "all", 
          scrollTrigger: {
            trigger: pageRef.current,
            start: "top 85%", 
            once: true, 
          }
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={pageRef}
      id={`broadsheet-${pageNumber}`} 
      className="broadsheet-page w-full max-w-[1400px] mx-auto bg-[#030303] border-[12px] border-double border-white/80 mb-24 relative flex flex-col"
    >
      {/* PAGE MASTHEAD */}
      {pageNumber === 1 ? (
        <header className="px-6 sm:px-12 pt-12 pb-6 border-b-[6px] border-white">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-white/20 pb-4 mb-6 text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <CloudSun className="w-4 h-4" /> Silcoorie Grant Edition
            </div>
            <div>{currentDate}</div>
            <div className="hidden sm:block">Public Record • Vol. 0{pageNumber}</div>
          </div>
          <div className="text-center w-full">
            <h1 className="text-6xl sm:text-[9vw] font-serif font-black uppercase tracking-tighter leading-[0.75] mb-6">
              The Daily <br className="sm:hidden" /> Dispatch
            </h1>
            <p className="font-sans font-bold uppercase tracking-[0.4em] text-white/50 text-[10px] sm:text-xs">
              Unfiltered Truth. Independent Voices.
            </p>
          </div>
        </header>
      ) : (
        <div className="flex justify-between items-center px-8 py-3 border-b-[6px] border-white font-mono text-[10px] uppercase tracking-widest text-white/50">
          <span>The Daily Dispatch</span>
          <span>Page {pageNumber}</span>
          <span>{currentDate}</span>
        </div>
      )}

      {/* THE EDITORIAL LAYOUT ENGINE */}
      <div className="flex flex-col lg:flex-row w-full flex-1">
        
        {/* LEFT MASTER COLUMN */}
        <div className="flex flex-col w-full lg:w-[65%] border-b-2 lg:border-b-0 lg:border-r-2 border-white/30">
          
          {/* SLOT 1: LEAD STORY */}
          {items[0] && (
            <article className={cn("p-8 flex flex-col", (items[2] || items[3]) ? "border-b-2 border-white/30" : "flex-1")}>
              <NewspaperArticle item={items[0]} variant="lead" />
            </article>
          )}

          {/* BOTTOM SPLIT */}
          {(items[2] || items[3]) && (
            <div className="flex flex-col md:flex-row flex-1">
              {/* SLOT 3: BOTTOM LEFT */}
              {items[2] && (
                <article className={cn("p-8 flex-1 flex flex-col", items[3] ? "border-b-2 md:border-b-0 md:border-r-2 border-white/30" : "")}>
                  <NewspaperArticle item={items[2]} variant="standard" />
                </article>
              )}
              {/* SLOT 4: BOTTOM RIGHT */}
              {items[3] && (
                <article className="p-8 flex-1 flex flex-col">
                  <NewspaperArticle item={items[3]} variant="standard" />
                </article>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR COLUMN */}
        {items[1] && (
          <div className="w-full lg:w-[35%] flex flex-col bg-white/[0.02]">
            <article className="p-8 flex-1 flex flex-col h-full">
              <NewspaperArticle item={items[1]} variant="sidebar" />
            </article>
          </div>
        )}
      </div>

    </div>
  );
}