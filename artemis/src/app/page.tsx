import Image from "next/image";
//import ScrollToTop from "@/components/ScrollToTop";
import type { Metadata } from "next";
import LandingPage from "@/components/Landing";
//import Report from "@/components/Report/page";

export default function Home() {
  return (
    <div>
        {/* <ScrollToTop /> */}
        <LandingPage />

    </div>
  );
}
