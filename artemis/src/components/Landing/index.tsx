"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

interface MappedCustomer {
  customer_id: string;
  nessie_customer_id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
}

export default function LandingPage(){
    const [firstName, setFirstName] = useState<string>("");
    const [showTyping, setShowTyping] = useState<boolean>(false);
    const [animalId, setAnimalId] = useState(1);

    const inventoryItems = [
        { id: 1, name: "Rabbit", rarity: "Common", image: "images/bunny.svg", logo: "/images/bunny_logo.svg" },
        { id: 2, name: "Bear", rarity: "Rare", image: "images/bear.svg", logo: "/images/bear_logo.svg" },
        { id: 3, name: "Deer", rarity: "Legendary", image: "images/deer.svg", logo: "/images/deer_logo.svg" },
    ];

    useEffect(() => {
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

        async function fetchName() {
            try {
                const res = await fetch(`${backend}/api/customers-mapped`, { cache: "no-store" });
                if (res.ok) {
                    const data: MappedCustomer[] = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        if (data[0].first_name) {
                            setFirstName(data[0].first_name);
                        } else if (data[0].name) {
                            setFirstName(data[0].name.split(" ")[0]);
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load customer name:", e);
            }
        }

        fetchName();

        // Load saved animal from localStorage
        const savedId = localStorage.getItem("selectedAnimalId");
        if (savedId) {
            setAnimalId(Number(savedId));
        }

        // Trigger typing animation after component mounts
        setTimeout(() => setShowTyping(true), 100);
    }, []);

    const currentLogo = inventoryItems.find(item => item.id === animalId)?.logo;

    return(
        <div className="relative grid grid-cols-10 [grid-template-rows:repeat(10,1fr)] md:[grid-template-rows:repeat(14,80px)] min-h-screen sm:min-h-fit w-full overflow-hidden pb-8">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#36336A] via-[#5a5080] to-[#7a506a]" />

            <div className="absolute z-20 left-40 top-4 -translate-x-1/2" >
                <Image
                    src="/images/starL.svg"
                    alt="stars on the left side"
                    width={350}
                    height={350}
                    className="object-contain"
                />
            </div>

            <div className="absolute z-20 right-40 top-4 translate-x-1/2" >
                <Image
                    src="/images/starR.svg"
                    alt="stars on the right side"
                    width={500}
                    height={500}
                    className="object-contain"
                />
            </div>

            <div className="absolute z-20 left-1/2 top-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <Image
                    src={currentLogo || "/images/bunny_logo.svg"}
                    alt="bunny logo"
                    width={400}
                    height={600}
                    className="object-contain"
                />
                <div className="w-full flex justify-center">
                    <p className={`font-mono text-3xl text-[#FFE8B3] text-center ${showTyping ? 'typing-text' : 'opacity-0'}`}>
                        Hello {firstName && `${firstName}, `}I am Artemis
                    </p>
                </div>
            </div>

            {/* Two Cards Section */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 gap-6 z-30">
                {/* First Card - Logo and Short Tagline */}
                <a
                    href="#"
                    className="flex flex-row items-center gap-6 rounded-xl
                            bg-[#0b0a22] border border-[#121232] shadow-[0_0_25px_rgba(255,232,179,0.15)]
                            hover:shadow-[0_0_35px_rgba(255,232,179,0.3)] hover:border-[#FFE8B3]/40
                            transition-all duration-300 w-full max-w-xl overflow-hidden px-6 py-4"
                >
                    {/* Logo */}
                    <div className="shrink-0">
                        <Image
                            src={"/images/talk_bun.svg"}
                            alt="Artemis logo"
                            width={80}
                            height={80}
                            className="object-contain"
                        />
                    </div>

                    {/* Text */}
                    <div className="flex flex-col">
                        <h5 className="text-xl font-mono font-bold tracking-tight text-[#FFE8B3]">
                            Let the Jade Rabbit guide your journey!
                        </h5>
                    </div>
                </a>

                {/* Second Card - Detailed Explanation */}
                <div
                    className="flex flex-col items-center justify-center rounded-xl
                            bg-[#0b0a22] border border-[#121232] shadow-[0_0_25px_rgba(255,232,179,0.15)]
                            w-full max-w-2xl overflow-hidden text-center p-8"
                >
                    <h5 className="mb-4 text-2xl font-mono font-bold tracking-tight text-[#FFE8B3]">
                        Your Personal Financial Assistant
                    </h5>
                    <p className="font-mono text-white/80 text-base leading-relaxed mb-3">
                        Artemis helps you take control of your finances with intelligent insights and personalized guidance.
                        Track your spending, understand your credit, and build better financial habits.
                    </p>
                    <p className="font-mono text-white/70 text-sm">
                        Join thousands reimaining their financial future with AI-powered assistance.
                    </p>
                </div>
            </div>
        </div>
    )
}
