import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Lora, JetBrains_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-barlow", display: "swap" });
const barlowCondensed = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-barlow-condensed", display: "swap" });
const lora = Lora({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-lora", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const urdu = Noto_Nastaliq_Urdu({ subsets: ["arabic"], weight: ["500", "700"], variable: "--font-urdu", display: "swap" });

export const metadata: Metadata = {
  title: { default: "SAVD — Submersible Autonomous Vehicle Design", template: "%s · SAVD" },
  description:
    "SAVD — Pakistan's national autonomous underwater vehicle design competition, organized by the Mechanical Engineering Society, University of Lahore.",
};

export const viewport: Viewport = { themeColor: "#06192b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable} ${lora.variable} ${jetbrains.variable} ${urdu.variable}`}>
      <body>{children}</body>
    </html>
  );
}
