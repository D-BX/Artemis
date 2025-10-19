import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Credit Report",
  description: "This is a generated credit report",
};

export default function Report() {
    return(
        <div className="relative grid grid-cols-10 [grid-template-rows:repeat(10,1fr)] md:[grid-template-rows:repeat(14,80px)] min-h-screen sm:min-h-fit w-full overflow-hidden pb-8">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#36336A] via-[#5a5080] to-[#7a506a]" />

            <div className="absolute left-0 top-[20%] -translate-x-1/2">
                <Image
                    src={"/images/star_scat_L.svg"}
                    alt="stars scattered"
                    width={200}
                    height={200}
                    className="object-contain"
                />
            </div>

            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
                <h1 className="font-mono text-5xl text-[#FFE8B3] text-center">
                    Credit Report
                </h1>
                <p className="font-mono text-2xl text-white text-center mt-4">butt</p>
            </div>

            {/* Credit score text - centered toward the bottom */}
            <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 z-10 w-full">
                <p className="font-mono text-4xl text-[#FFE8B3] text-center">Your credit score</p>
            </div>

            {/* Moon image - spans width and positioned in grid */}
            <div className="col-span-8 col-start-2 row-span-4 row-start-7 relative z-0">
                <Image
                    src={"/images/moon_count.svg"}
                    alt="moon image"
                    fill
                    className="object-contain "
                />
                {/* Credit score number - centered on top of the moon */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <p className="font-mono text-6xl font-bold text-black">100</p>
                </div>
            </div>
        </div>
    )
}