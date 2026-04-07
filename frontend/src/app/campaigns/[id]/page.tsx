'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MapPin, Activity, ShieldCheck, Flag, Crosshair, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Campaign } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

export default function CampaignProfilePage() {
  const params = useParams();
  const campaignId = typeof params.id === 'string' ? params.id : '';
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    const getCampaign = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/campaign/${campaignId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.data.success) {
          setCampaign(response.data.data?.campaign || response.data.campaign);
        }
      } catch (error) {
        console.error("Failed to load campaign", error);
      } finally {
        setIsLoading(false);
      }
    }
    getCampaign();
  }, [token, campaignId]);

  useLayoutEffect(() => {
    if (!isLoading && campaign) {
      let ctx = gsap.context(() => {
        // Image Parallax
        gsap.to(imageRef.current, {
          yPercent: 30,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          }
        });

        // Content Entrance
        gsap.from(".reveal-element", {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
          delay: 0.2
        });

        // Number Ticker for Momentum Score
        const scoreElement = document.querySelector('.momentum-score');
        if (scoreElement) {
          gsap.fromTo(scoreElement, 
            { innerHTML: 0 },
            { 
              innerHTML: campaign.popularityScore || 0,
              duration: 2,
              ease: "power3.out",
              snap: { innerHTML: 1 }
            }
          );
        }

      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, campaign]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center font-mono text-amber-500 uppercase tracking-[0.4em] text-xs">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        Accessing Initiative Data...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white">
        <Crosshair className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Record Not Found</h1>
        <p className="text-white/50 font-mono text-xs uppercase mb-8">The initiative you are searching for does not exist or has been removed.</p>
        <Link href="/campaigns">
          <button className="px-6 py-3 border border-white/20 hover:bg-white hover:text-black font-bold uppercase tracking-widest text-xs transition-colors">
            Return to Directory
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#050505] w-full font-sans selection:bg-amber-500 selection:text-black pb-32 overflow-hidden">
      
      {/* 1. TOP UTILITY BAR (Plain English, Terminal Vibe) */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#050505]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <Link href="/campaigns" className="group flex items-center gap-2 text-white/50 hover:text-amber-500 transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Back to Directory</span>
        </Link>
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/30">
          Initiative_ID: {campaign._id.slice(-8)}
        </div>
      </div>

      {/* 2. THE CINEMATIC BILLBOARD */}
      <div className="relative w-full h-[50vh] md:h-[70vh] bg-black overflow-hidden mt-14">
        {campaign.imageUrl ? (
          <div ref={imageRef} className="absolute inset-0 w-full h-[130%] -top-[15%]">
            <Image
              src={campaign.imageUrl}
              alt={campaign.name}
              fill
              className="object-cover grayscale contrast-125 opacity-60"
              priority
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)] flex items-center justify-center">
            <span className="font-black text-white/10 uppercase text-4xl tracking-tighter">No Visual Record</span>
          </div>
        )}
        
        {/* Gradient Fade to Black */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        
        {/* Registration Marks */}
        <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-amber-500" />
        <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-amber-500" />
      </div>

      {/* 3. THE CORE DATA BLOCK */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 sm:px-12 -mt-32">
        <div className="reveal-element flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          
          <div className="w-full md:w-2/3">
            <div className="flex flex-wrap items-center gap-4 mb-6 text-[10px] font-mono uppercase tracking-widest text-white/70">
              <span className="flex items-center gap-2 border border-white/20 bg-white/5 px-3 py-1 backdrop-blur-sm">
                <MapPin className="w-3 h-3 text-amber-500" /> {campaign.location}
              </span>
              <span className="flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 text-amber-500 px-3 py-1 backdrop-blur-sm">
                <ShieldCheck className="w-3 h-3" /> {campaign.category}
              </span>
              {campaign.party && (
                <span className="flex items-center gap-2 border border-white/20 bg-white/5 px-3 py-1 backdrop-blur-sm">
                  <Flag className="w-3 h-3 text-white/50" /> {campaign.party}
                </span>
              )}
            </div>
            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-[0.85] text-white">
              {campaign.name}
            </h1>
          </div>

          {/* Momentum Score Block */}
          <div className="w-full md:w-auto p-6 border-l-4 border-amber-500 bg-white/[0.02] backdrop-blur-sm flex flex-col items-start md:items-end">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 flex items-center gap-2 mb-2">
              <Activity className="w-3 h-3 text-amber-500 animate-pulse" /> Community Momentum
            </span>
            <div className="text-6xl font-black text-white leading-none momentum-score">
              0
            </div>
          </div>
        </div>

        {/* 4. THE MANDATE (Description) */}
        <div className="reveal-element grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16 border-t-2 border-white/10 pt-16">
          
          {/* Left Column: Label */}
          <div className="lg:col-span-3">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 sticky top-24">
              Official Mandate & <br/> Initiative Details
            </h2>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-9">
            <div className="text-xl md:text-2xl font-medium leading-relaxed text-white/80 text-justify first-letter:text-8xl first-letter:font-black first-letter:text-white first-letter:float-left first-letter:mr-4 first-letter:mt-2 first-letter:leading-[0.75]">
              {campaign.description || "No official mandate has been submitted to the public record for this initiative."}
            </div>

            {/* Interactive Call to Action */}
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-6">
               <button className="flex-1 py-5 bg-amber-500 text-black font-black uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                 Join This Initiative
               </button>
               <button className="flex-1 py-5 bg-transparent border-2 border-white text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                 Share Secure Link
               </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}