import Image from "next/image";

export default function Loading() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background gradient matching your report page */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#36336A] via-[#5a5080] to-[#7a506a]" />

      {/* Decorative star scatter */}
      <div className="absolute inset-0 z-10">
        <Image
          src="/images/stars-splay.svg"
          alt="stars background"
          fill
          className="object-cover"
        />
      </div>

      {/* Loading content */}
      <div className="relative z-20 flex flex-col items-center space-y-8">
        {/* Title */}
        <h1 className="font-mono text-4xl md:text-5xl text-[#FFE8B3] mb-2 animate-pulse drop-shadow-md">
          Loading Report...
        </h1>

        {/* Subtext */}
        <p className="font-mono text-white/80 text-lg">
          Gathering your credit data among the stars ✨
        </p>

        {/* Animated dots */}
        <div className="flex space-x-2">
          <div
            className="w-3 h-3 bg-[#FFE8B3] rounded-full animate-pulse"
            style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
          ></div>
          <div
            className="w-3 h-3 bg-[#FFE8B3] rounded-full animate-pulse"
            style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
          ></div>
          <div
            className="w-3 h-3 bg-[#FFE8B3] rounded-full animate-pulse"
            style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
          ></div>
        </div>
      </div>
    </div>
  );
}