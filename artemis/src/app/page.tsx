import Image from "next/image";
//import ScrollToTop from "@/components/ScrollToTop";
import type { Metadata } from "next";
import LandingPage from "@/components/Landing";
//import Report from "@/components/Report/page";
import About from "@/components/About";
//import Report from "@/components/Report/page";
import Gacha from "@/components/Gacha";
import Game from "@/components/Game";
export default function Home() {
  return (
    <div>
        {/* <ScrollToTop /> */}
        <Game />
        {/* <About /> */}
        {/* <Gacha /> */}
    </div>
  );
}
