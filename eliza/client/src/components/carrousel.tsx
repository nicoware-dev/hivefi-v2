"use client";

import { useEffect, useState, useRef } from "react";

// Import all logos
import ai16z from "../assets/logos-ext/ai16z.svg";
import coingecko from "../assets/logos-ext/coingecko.svg";
import defillama from "../assets/logos-ext/defillama.svg";
import discord from "../assets/logos-ext/discord.svg";
import telegram from "../assets/logos-ext/telegram.svg";
import elizaos from "../assets/logos-ext/elizaos.svg";
import beets from "../assets/logos-ext/beets.svg";
import soniclabs from "../assets/logos-ext/sonic.svg";
import silo from "../assets/logos-ext/silo.svg";
import geckoterminal from "../assets/logos-ext/geckoterminal.svg";
import n8n from "../assets/logos-ext/n8n.svg";
import debridge from "../assets/logos-ext/debridge.svg";
import x_dark from "../assets/logos-ext/x_dark.svg";

const logos = [
  { id: "ai16z", src: ai16z, alt: "AI16Z" },
  { id: "elizaos", src: elizaos, alt: "ElizaOS" },
  { id: "n8n", src: n8n, alt: "n8n" },
  { id: "defillama", src: defillama, alt: "DefiLlama" },
  { id: "coingecko", src: coingecko, alt: "CoinGecko" },
  { id: "geckoterminal", src: geckoterminal, alt: "GeckoTerminal" },
  { id: "soniclabs", src: soniclabs, alt: "SonicLabs" },
  { id: "beets", src: beets, alt: "Beets" },
  { id: "silo", src: silo, alt: "Silo" },
  { id: "debridge", src: debridge, alt: "deBridge" },
  { id: "discord", src: discord, alt: "Discord" },
  { id: "telegram", src: telegram, alt: "Telegram" },  
  { id: "x_dark", src: x_dark, alt: "X" },
];

export function LogoCarousel() {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const scrollContainer = containerRef.current;
    const totalWidth = scrollContainer.scrollWidth / 2;
    let animationFrameId: number;

    const scroll = () => {
      if (!isHovered) {
        scrollPositionRef.current += 1;
        if (scrollPositionRef.current >= totalWidth) {
          scrollPositionRef.current = 0;
        }
        scrollContainer.style.transform = `translateX(-${scrollPositionRef.current}px)`;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    scroll();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isHovered]);

  return (
    <div className="w-full overflow-hidden bg-background/80 backdrop-blur-sm border-y border-white/[0.08] py-12">
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={containerRef}
          className="flex space-x-12 whitespace-nowrap"
          style={{
            willChange: 'transform',
          }}
        >
          {/* First set of logos */}
          {logos.map((logo) => (
            <div
              key={`first-${logo.id}`}
              className="inline-block w-32 h-16 flex-shrink-0"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="w-full h-full object-contain filter brightness-75 hover:brightness-100 transition-all duration-300"
                title={logo.alt}
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {logos.map((logo) => (
            <div
              key={`second-${logo.id}`}
              className="inline-block w-32 h-16 flex-shrink-0"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="w-full h-full object-contain filter brightness-75 hover:brightness-100 transition-all duration-300"
                title={logo.alt}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
