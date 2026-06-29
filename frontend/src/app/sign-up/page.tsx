"use client";

import React from 'react';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6">
      <SignUp 
        signInUrl="/login"
        appearance={{
          elements: {
            rootBox: "w-full max-w-[440px]",
            card: "bg-[#0a0a0a] border border-white/10 shadow-2xl rounded-[2rem]",
            headerTitle: "text-white",
            headerSubtitle: "text-white/50",
            socialButtonsBlockButton: "border-white/10 text-white hover:bg-white/5",
            socialButtonsBlockButtonText: "font-bold",
            dividerLine: "bg-white/10",
            dividerText: "text-white/50",
            formFieldLabel: "text-white/80 font-bold",
            formFieldInput: "bg-[#111] border-white/10 text-white focus:border-amber-500 rounded-xl",
            formButtonPrimary: "bg-amber-500 hover:bg-amber-600 text-black font-black",
            footerActionText: "text-white/50",
            footerActionLink: "text-amber-500 hover:text-amber-400"
          }
        }}
      />
    </div>
  );
}
