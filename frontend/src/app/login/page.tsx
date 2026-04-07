"use client";

import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, ArrowRight, ArrowLeft, Smartphone, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';
import gsap from 'gsap';
import { useLogin, PhoneFormData, OtpFormData } from '@/app/login/hooks/useLogin'; 

// Utility for high-end staggered typography animations
const splitText = (text: string) => {
  return text.split(' ').map((word, i) => (
    <span key={i} className="inline-block overflow-hidden pb-2 mr-3">
      <span className="title-word inline-block translate-y-[120%] opacity-0">{word}</span>
    </span>
  ));
};

export default function LoginPage() {
  const { isLoading, isOtpSent, phoneNumber, handleSendOtp, handleVerifyOtp } = useLogin();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const formWrapperRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { register: registerPhone, handleSubmit: handleSubmitPhone, formState: { errors: phoneErrors } } = useForm<PhoneFormData>();
  const { register: registerOtp, handleSubmit: handleSubmitOtp, formState: { errors: otpErrors } } = useForm<OtpFormData>();

  // Smooth Cursor & Ambient Spotlight Logic
  useEffect(() => {
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX; mouseY = e.clientY;
      setMousePos({ x: mouseX, y: mouseY });
    };
    const render = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      gsap.set(cursorRef.current, { x: cursorX, y: cursorY });
      requestAnimationFrame(render);
    };
    window.addEventListener("mousemove", onMouseMove);
    const ticker = requestAnimationFrame(render);
    return () => { window.removeEventListener("mousemove", onMouseMove); cancelAnimationFrame(ticker); };
  }, []);

  // Mount Animations
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Staggered Studio-Quality Text Reveal
      gsap.to(".title-word", {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.2
      });

      gsap.from(".fade-up", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.6
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Form Transition Animation (Phone -> OTP)
  useLayoutEffect(() => {
    if (isOtpSent && formWrapperRef.current) {
      let ctx = gsap.context(() => {
        gsap.fromTo(".otp-view", 
          { opacity: 0, scale: 0.95, x: 20 },
          { opacity: 1, scale: 1, x: 0, duration: 0.6, ease: "power3.out", delay: 0.1 }
        );
      }, formWrapperRef);
      return () => ctx.revert();
    }
  }, [isOtpSent]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030303] flex flex-col lg:flex-row text-white selection:bg-amber-500 selection:text-black cursor-none overflow-hidden relative font-sans">
      
      {/* --- Custom Cursor & Ambient Glow --- */}
      <div className="fixed top-0 left-0 w-2 h-2 bg-amber-500 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2" style={{ left: mousePos.x, top: mousePos.y }} />
      <div ref={cursorRef} className="fixed top-0 left-0 w-10 h-10 border border-amber-500/40 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out" />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30" style={{ background: `radial-gradient(circle 800px at ${mousePos.x}px ${mousePos.y}px, rgba(245, 158, 11, 0.12), transparent 80%)` }} />

      {/* =========================================
          LEFT SIDE: THE STORY & CONTEXT
          ========================================= */}
      <div className="w-full lg:w-5/12 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#080808] relative flex flex-col justify-between p-8 lg:p-16 z-10 min-h-[40vh] lg:min-h-screen">
        
        <div className="fade-up">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-amber-500 transition-colors font-bold text-xs uppercase tracking-widest mb-12">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="w-12 h-12 bg-amber-500 flex items-center justify-center text-black font-black text-2xl mb-12 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            R
          </div>
        </div>
        
        <div className="mb-auto mt-8 lg:mt-0">
          <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            {splitText("Your City.")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              {splitText("Your Voice.")}
            </span>
          </h1>
          <p className="fade-up text-white/60 text-lg md:text-xl max-w-md font-medium leading-relaxed">
            Log in to connect with your local representatives, raise community issues, and drive real change in your neighborhood.
          </p>
        </div>

        <div className="fade-up mt-12 hidden lg:flex items-center gap-4 border-t border-white/10 pt-8">
          <div className="flex -space-x-3">
            {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-[#080808] bg-white/10 flex items-center justify-center"><Users className="w-4 h-4 text-white/50"/></div>)}
          </div>
          <p className="text-sm font-medium text-white/50">Join <strong className="text-white">thousands</strong> of citizens <br/>shaping their local districts.</p>
        </div>
      </div>

      {/* =========================================
          RIGHT SIDE: THE HIGH-END FORM
          ========================================= */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-8 lg:p-16 relative z-10">
        <div ref={formWrapperRef} className="w-full max-w-[440px] relative">
          
          {!isOtpSent ? (
            /* --- STEP 1: PHONE NUMBER FORM --- */
            <div className="fade-up phone-view bg-[#0a0a0a] border border-white/10 p-8 sm:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
              
              <div className="mb-10">
                <h2 className="text-3xl font-black tracking-tight mb-2">Welcome Back</h2>
                <p className="text-white/50 font-medium">Enter your mobile number to securely sign in or create a new account.</p>
              </div>
              
              <form onSubmit={handleSubmitPhone(handleSendOtp)} className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-white/80 mb-3">
                    Mobile Number
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-white/10 pr-3">
                      <span className="text-white/40 font-bold text-lg">+91</span>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="00000 00000"
                      {...registerPhone('phone', { 
                        required: "Phone number is required",
                        pattern: { value: /^[0-9]{10}$/, message: "Please enter a valid 10-digit number." }
                      })}
                      className="w-full bg-[#111] border border-white/10 rounded-2xl text-white pl-20 pr-4 py-4 text-xl font-medium focus:border-amber-500 focus:bg-amber-500/5 focus:outline-none transition-all placeholder:text-white/20"
                      disabled={isLoading}
                    />
                  </div>
                  {phoneErrors.phone && <span className="text-amber-500 text-sm font-bold mt-2 block">{phoneErrors.phone.message}</span>}
                </div>

                <div className="bg-white/5 rounded-xl p-4 flex items-start gap-3 text-sm text-white/50">
                  <MapPin className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                  <p>To show you relevant local issues, we will securely request your current location upon login.</p>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group text-lg"
                >
                  {isLoading ? 'Sending Code...' : 'Continue'} 
                  {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          ) : (
            /* --- STEP 2: OTP VERIFICATION FORM --- */
            <div className="otp-view bg-[#0a0a0a] border border-white/10 p-8 sm:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
              
              <div className="mb-10">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-2">Check Your Phone</h2>
                <p className="text-white/50 font-medium">
                  We've sent a 6-digit verification code to <br/>
                  <strong className="text-white tracking-wide block mt-1">+91 {phoneNumber}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmitOtp(handleVerifyOtp)} className="space-y-8">
                <div>
                  <label htmlFor="otp" className="block text-sm font-bold text-white/80 mb-3">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="• • • • • •"
                    maxLength={6}
                    autoFocus
                    {...registerOtp('otp', { 
                      required: "Code is required",
                      minLength: { value: 6, message: "Code must be exactly 6 digits." }
                    })}
                    className="w-full bg-[#111] border border-white/10 rounded-2xl text-center text-white py-5 text-4xl tracking-[0.5em] font-mono focus:border-amber-500 focus:bg-amber-500/5 focus:outline-none transition-all placeholder:text-white/10"
                    disabled={isLoading}
                  />
                  {otpErrors.otp && <span className="text-amber-500 text-sm font-bold mt-2 block text-center">{otpErrors.otp.message}</span>}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-amber-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                >
                  {isLoading ? 'Verifying...' : 'Secure Login'}
                  {!isLoading && <ShieldCheck className="w-5 h-5" />}
                </button>
              </form>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}