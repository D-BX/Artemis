"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import SpendingAnalysis from "@/components/SpendingAnalysis";

export default function BudgetPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    console.log("File selected:", file.name, "Size:", file.size);
    setUploadedFile(file);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Sending file to backend...");
      const response = await fetch("/api/parse-statement", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.error || "Failed to parse statement");
      }

      const data = await response.json();
      console.log("Parsed data:", data);

      if (!data.transactions || data.transactions.length === 0) {
        alert("No transactions found in the PDF. Please check the file format.");
        setIsLoading(false);
        return;
      }

      setParsedData(data);
    } catch (error) {
      console.error("Error parsing statement:", error);
      alert(`Failed to parse statement: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  if (parsedData) {
    return <SpendingAnalysis data={parsedData} />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#36336A] via-[#5a5080] to-[#7a506a]" />

      <div className="absolute inset-0 z-10 pointer-events-none">
        <Image
          src="/images/stars-splay.svg"
          alt="stars background"
          fill
          className="object-cover"
        />
      </div>

      <div className="relative z-30 w-full flex justify-center pt-10 px-4">
        <Image
          src="/images/smartbalancing.svg"
          alt="smart balancing"
          width={280}
          height={280}
          className="object-contain"
        />
      </div>

      {isLoading ? (
        <div className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-center">
            <div className="font-mono text-[#FFE8B3] text-2xl mb-4 animate-pulse">
              Parsing Statement...
            </div>
            <div className="font-mono text-[#FFE8B3]/70 text-sm">
              This may take a few moments
            </div>
          </div>
        </div>
      ) : (
        <div
          className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-105"
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <Image
            src="/images/importstatement.svg"
            alt="Import Statement file upload"
            width={250}
            height={250}
            className={`object-contain ${isDragging ? "opacity-70" : ""}`}
          />
        </div>
      )}
    </div>
  );
}
