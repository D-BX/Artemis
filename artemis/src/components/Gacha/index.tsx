"use client";
import Image from "next/image";
import Link from "next/link";

export default function GachaPage(){
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

            <div className="relative z-30 col-span-10 row-span-2 flex items-center justify-center">
                <h1 className="font-modern-antiqua text-4xl md:text-7xl text-[#FFE8B3] text-center font-bold">
                    GACHA
                </h1>
            </div>

            <div className="absolute z-20 left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2">
                <div className="flex flex-col items-center space-y-6">
                    <Image
                        src="/images/gacha_roll.svg"
                        alt="gacha roll logo"
                        width={400}
                        height={600}
                        className="object-fill"
                    />
                    
                    {/* Buttons */}
                    <div className="flex flex-col space-y-4 w-full max-w-xs">
                        <button className="font-mono bg-[#FFE8B3] text-[#5a5080] px-8 py-4 rounded-full text-xl font-semibold hover:bg-[#F5D982] transition-all duration-300 shadow-lg">
                            Roll
                        </button>
                        <button className="font-mono bg-[#FFE8B3] text-[#5a5080] px-8 py-4 rounded-full text-xl font-semibold hover:bg-[#F5D982] transition-all duration-300 shadow-lg">
                            Inventory
                        </button>
                    </div>
                </div>  
            </div>

        </div>
    )
}