"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="relative">
        <Image
          src="/images/navbar.svg"
          alt="Navigation bar"
          width={339}
          height={75}
          className="object-contain"
        />

        <div className="absolute inset-0 flex items-center justify-around px-8">
          <Link
            href="/"
            className="w-16 h-16 flex items-center justify-center"
            aria-label="Home"
          />

          <Link
            href="/budget"
            className="w-16 h-16 flex items-center justify-center"
            aria-label="Budget"
          />

          <Link
            href="/Report"
            className="w-16 h-16 flex items-center justify-center"
            aria-label="Credit Report"
          />

          <Link
            href="/gacha"
            className="w-16 h-16 flex items-center justify-center"
            aria-label="Gacha"
          />
        </div>
      </div>
    </nav>
  );
}
