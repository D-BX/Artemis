import Image from "next/image";
//import ScrollToTop from "@/components/ScrollToTop";
import type { Metadata } from "next";
import LandingPage from "@/components/Landing";
//import Report from "@/components/Report/page";
import About from "@/components/About";
export default function Home() {
  return (
    <div>
        {/* <ScrollToTop /> */}
        <LandingPage />
        <About />
    </div>
  );
}
