"use client";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage(){
    return(
        <div className="relative grid grid-cols-10 [grid-template-rows:repeat(10,1fr)] md:[grid-template-rows:repeat(14,80px)] min-h-screen sm:min-h-fit w-full overflow-hidden pb-8">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#36336A] via-[#5a5080] to-[#7a506a]" />

            <div className="absolute z-20 left-0 top-4 -translate-x-1/2" >
                <Image
                    src="/images/starL.svg"
                    alt="stars on the left side"
                    width={600}
                    height={600}
                    className="object-contain"
                />
            </div>

            <div className="absolute z-20 right-0 top-4 translate-x-1/2" >
                <Image
                    src="/images/starR.svg"
                    alt="stars on the right side"
                    width={600}
                    height={600}
                    className="object-contain"
                />
            </div>

            <div className="absolute z-20 left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2">
                <Image
                    src="/images/bunny.svg"
                    alt="bunny logo"
                    width={600}
                    height={600}
                    className="object-fill"

                />
                <p className="font-mono text-2xl text-[#FFE8B3] text-center ">
                    Hello, My name is Artemis
                </p>
                <Link
                    href="/Report"
                    className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                >
                    Credit Report
                </Link>
            </div>

        </div>
    )
}