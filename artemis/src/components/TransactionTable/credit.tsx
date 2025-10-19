// src/components/TransactionTable/credit.tsx
"use client";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function CreditScoreSection() {
  return (
    <section className="relative flex flex-col items-center text-center py-12">
      {/* Title */}
      <h2 className="text-[#FFE8B3] font-modern-antiqua text-4xl md:text-5xl mb-2 tracking-wide">
        CREDIT SCORE
      </h2>

      {/* Date */}
      <p className="font-mono text-white/90 text-lg mb-8">
        As of 10/19/2025
      </p>

      {/* Lottie Gauge */}
      <div className="relative w-[300px] md:w-[420px] mb-8 z-10">
        <DotLottieReact
          src="https://lottie.host/58c94897-38b7-4792-960f-44e70d105172/kMxNeh1DSW.lottie"


          autoplay
          speed={0.5}
        />
      </div>

      {/* Score Range Text */}
      <div>
        <p className="font-mono text-2xl text-white mb-1">600 - 700</p>
        <p className="font-mono text-xl text-[#FFE8B3]">Fair</p>
      </div>

      {/* Optional stars or glow */}
      {/* <div className="absolute inset-0 -z-10 opacity-30">
        <img
          src="/images/star_scat_L.svg"
          alt=""
          className="absolute top-6 left-10 w-24"
        />
        <img
          src="/images/star_scat_L.svg"
          alt=""
          className="absolute bottom-10 right-10 w-20 rotate-45"
        />
      </div> */}
    </section>
  );
}


