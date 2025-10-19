"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage(){
    const [animalId, setAnimalId] = useState(1);

    const inventoryItems = [
        { id: 1, name: "Rabbit", rarity: "Common", image: "images/bunny.svg", logo: "/images/bunny_logo.svg" },
        { id: 2, name: "Bear", rarity: "Rare", image: "images/bear.svg", logo: "/images/bear_logo.svg" },
        { id: 3, name: "Deer", rarity: "Legendary", image: "images/deer.svg", logo: "/images/deer_logo.svg" },
    ];

    useEffect(() => {
        const savedId = localStorage.getItem("selectedAnimalId");
        if (savedId) {
            setAnimalId(Number(savedId))
        };
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
                    className="object-fill"

                />
                <p className="font-mono text-4xl text-[#FFE8B3] text-center ">
                    Hello, My name is Artemis
                </p>
            </div>

            {/* <div className="absolute z-20 left-1/2 top-[0%] -translate-x-1/2 -translate-y-1/2 flex items-start justify-center pointer-events-none">
                <div className="relative w-[400px] h-[200px]">
                    {/* Static sun rays with pulse animation in perfect semicircle
                    {[...Array(13)].map((_, i) => {
                    const angle = (i * 15) - 90 // Perfect semicircle: -90 to 90 degrees (180 degree arc)
                    const length = i % 3 === 0 ? 80 : i % 2 === 0 ? 60 : 70
                    const isDotted = i % 4 === 1 || i % 4 === 2
                    return (
                        <div
                        key={i}
                        className="absolute top-[50px] left-1/2 origin-bottom"
                        style={{
                            transform: `translateX(-50%) rotate(${angle}deg)`,
                        }}
                        >
                        {isDotted ? (
                            <div className="flex flex-col items-center gap-2">
                            <div
                                className="w-1.5 h-1.5 bg-[#FFE8B3] rounded-full animate-pulse"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                            <div
                                className="w-1.5 h-1.5 bg-[#FFE8B3] rounded-full animate-pulse"
                                style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
                            />
                            <div
                                className="w-1.5 h-1.5 bg-[#FFE8B3] rounded-full animate-pulse"
                                style={{ animationDelay: `${i * 0.1 + 0.4}s` }}
                            />
                            </div>
                        ) : (
                            <div
                            className="w-1.5 bg-[#FFE8B3] rounded-full animate-pulse"
                            style={{
                                height: `${length}px`,
                                animationDelay: `${i * 0.1}s`
                            }}
                            />
                        )}
                        </div>
                    )
                    })}
                </div>
            </div> */}
        </div>
    )
}