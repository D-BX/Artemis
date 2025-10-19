"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
//import About from "../About";

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
        // Trigger typing animation after component mounts
        setTimeout(() => setShowTyping(true), 100);
    }, []);

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

            <div className="absolute z-20 left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <Image
                    src="/images/bunny_logo.svg"
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
            {/* FIX: need to fix colors and change the text and all that we can put like a team pic or sum idk */}
            {/* <div className="absolute inset-0 flex items-end justify-center pb-20">
                <a href="#" className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-sm md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                    <img className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" src="/images/fake_samp.png" alt=""/>
                    <div className="flex flex-col justify-between p-4 leading-normal">
                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5>
                        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
                    </div>
                </a>
            </div> */}






            {/* Sun animations i couldn't get it to splay out correctly */}
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