
import type { Metadata } from "next";
import { Geist, Geist_Mono, Modern_Antiqua } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const modernAntiqua = Modern_Antiqua({
  variable: "--font-modern-antiqua",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Artemis - Smart Financial Assistant",
  description: "AI-powered credit risk analysis and financial planning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${modernAntiqua.variable} antialiased`}
      >
        <main className="pb-32">
          {children}
        </main>
        <Navbar />
      </body>
    </html>
  );
}