"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function GachaPage(){
    const [showInventory, setShowInventory] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(1); // Track selected item by ID

    const [showRoll, setShowRoll] = useState(false);
    const [rolledItem, setRolledItem] = useState(null);

    const initialPool = [
        { id: 1, name: "Rabbit", rarity: "Common", image: "images/bunny.svg", rarityColor: "border-blue-400" },
        { id: 2, name: "Bear", rarity: "Rare", image: "images/bear.svg", rarityColor: "border-cyan-400" },
        { id: 3, name: "Deer", rarity: "Legendary", image: "images/deer.svg", rarityColor: "border-purple-400" },
    ];

    function rollGacha() {
        const probabilities = {
            Common: 0.7,
            Rare: 0.25,
            Legendary: 0.05
        };

        const rand = Math.random();
        let rarity;
        if (rand < probabilities.Legendary) {
            rarity = "Legendary";
        } else if (rand < probabilities.Legendary + probabilities.Rare) {
            rarity = "Rare";
        } else {
            rarity = "Common";
        }

        // Filter pool to matching rarity
        const filteredPool = initialPool.filter(item => item.rarity === rarity);

        // Pick a random item from that rarity
        const newItem = filteredPool[Math.floor(Math.random() * filteredPool.length)];

        setRolledItem(newItem);
        setShowRoll(true);
    }


    const inventoryItems = [
        {
            id: 1,
            name: "Rabbit",
            rarity: "Common",
            image: "/images/bunny.svg",
            rarityColor: "border-green-400",
        },
        {
            id: 2,
            name: "Bear",
            rarity: "Rare",
            image: "/images/bear.svg",
            rarityColor: "border-cyan-400",
        },
        {
            id: 3,
            name: "Deer",
            rarity: "Legendary",
            image: "/images/deer.svg",
            rarityColor: "border-purple-400",
        }
    ];

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
                {/* Debug indicator */}
                {/* <div className="absolute top-16 text-white text-sm">
                    {showInventory ? "Inventory is open" : "Inventory is closed"}
                </div> */}
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
                        <button
                            onClick={() => {
                                console.log("Roll button clicked");
                                rollGacha();
                            }}
                            className="font-mono bg-[#FFE8B3] text-[#5a5080] px-8 py-4 rounded-full text-xl font-semibold hover:bg-[#F5D982] transition-all duration-300 shadow-lg"
                            >
                            Roll
                        </button>
                        <button
                            onClick={() => {
                                console.log("Inventory button clicked");
                                setShowInventory(true);
                            }}
                            className="font-mono bg-[#FFE8B3] text-[#5a5080] px-8 py-4 rounded-full text-xl font-semibold hover:bg-[#F5D982] transition-all duration-300 shadow-lg"
                        >
                            Inventory
                        </button>
                    </div>
                </div>
            </div>

            {/* Inventory Model */}
            {showInventory && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-[#2B295A] rounded-2xl p-10 max-w-5xl w-full mx-6 max-h-[85vh] overflow-y-auto">
                        {/* Close button */}
                        <button
                            onClick={() => {
                                console.log("Close button clicked");
                                setShowInventory(false);
                            }}
                            className="absolute top-6 right-6 text-white hover:text-white text-3xl font-bold cursor-pointer hover:cursor-pointer"
                        >
                            X
                        </button>

                        {/* Header */}
                        <h2 className="font-modern-antiqua text-5xl text-white text-center mb-12 font-bold">
                            INVENTORY
                        </h2>

                        {/* Inventory Grid */}
                        <div className="grid grid-cols-3 gap-12">
                            {inventoryItems.map((item) => (
                                <div key={item.id} className="flex flex-col items-center space-y-4">
                                    {/* Animal SVG Box */}
                                    <div
                                        onClick={() => setSelectedItemId(item.id)}
                                        className={`relative bg-[#0B093A] rounded-xl border-2 ${
                                            selectedItemId === item.id
                                                ? 'border-[#FFD700] shadow-lg '
                                                : 'border-gray-600'
                                        } transition-all duration-300 hover:scale-105 w-75 h-75 overflow-hidden cursor-pointer`}
                                    >
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            width={180}
                                            height={180}
                                            className="object-contain absolute bottom-0 left-1/2 transform -translate-x-1/2"
                                        />
                                    </div>

                                    {/* Text content outside the box */}
                                    <div className="text-center space-y-1">
                                        {/* Animal Name */}
                                        <h3 className="font-mono text-white text-2xl font-semibold">
                                            {item.name}
                                        </h3>

                                        {/* Rarity */}
                                        <p className="text-gray-300 text-m">
                                            {item.rarity}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            )}


            {/* Roll Result Modal */}
            {showRoll && (
                <div
                    onClick={() => setShowRoll(false)}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                    <div className="absolute w-96 h-96 md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] rounded-full bg-[#0B093A] blur-[125px]"></div>

                    <div className="flex flex-col items-center justify-center p-8 rounded-2xl z-10">
                        <h2 className="font-modern-antiqua text-5xl text-[#FFE8B3] text-center mb-8 font-bold">
                            YOU GOT...
                        </h2>
                        <img
                            src={`/${rolledItem.image}`}
                            className="w-50 h-50 mb-6"
                        />
                        <h3 className="font-modern-antiqua text-5xl font-bold text-[#FFE8B3]">
                            {rolledItem.name}!
                        </h3>
                        <p className="font-mono text-lg text-[#D9D6B2] mt-2">
                            {rolledItem.rarity}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}