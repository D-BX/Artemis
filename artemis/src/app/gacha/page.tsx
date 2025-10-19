"use client";

import Image from "next/image";

export default function GachaPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Same gradient as landing page */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#36336A] via-[#5a5080] to-[#7a506a]" />

      {/* Decorative stars */}
      <div className="absolute z-20 left-0 top-4 -translate-x-1/2">
        <Image
          src="/images/starL.svg"
          alt="stars on the left side"
          width={600}
          height={600}
          className="object-contain"
        />
      </div>

      <div className="absolute z-20 right-0 top-4 translate-x-1/2">
        <Image
          src="/images/starR.svg"
          alt="stars on the right side"
          width={600}
          height={600}
          className="object-contain"
        />
      </div>

      {/* Content area */}
      <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="font-mono text-3xl text-[#FFE8B3] text-center mb-8">
          Gacha System
        </h1>
        <p className="font-mono text-[#FFE8B3] text-center">
          Coming soon...
        </p>
      </div>
    </div>
  );
}
