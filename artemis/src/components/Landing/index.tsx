import Image from "next/image";

export default function LandingPage(){
    return(
        <div className="relative grid grid-cols-10 [grid-template-rows:repeat(10,1fr)] md:[grid-template-rows:repeat(14,80px)] min-h-screen sm:min-h-fit w-full overflow-hidden pb-8">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[#36336A] via-transparent to-[#724C6A]" />

            <div className="relative z-10 col-start-1 col-span-10 row-start-1 row-span-8 flex items-top justify-center transform translate-y-4 -translate-x-1/2" >
                <Image
                    src="/images/starL.svg"
                    alt="stars on the left side"
                    width={600}
                    height={600}
                    className="object-contain"
                />
            </div>

            
        </div>

    )
}