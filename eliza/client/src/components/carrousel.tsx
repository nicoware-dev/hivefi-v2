"use client";

import { useEffect, useState, useRef } from "react";

import OneInch from '../assets/logos-ext/1inch.svg';
import Aave from '../assets/logos-ext/aave.svg';
import Agni from '../assets/logos-ext/agni.svg';
import Ai16z from '../assets/logos-ext/ai16z.svg';
import Arbitrum from '../assets/logos-ext/arbitrum.svg';
import Beefy from '../assets/logos-ext/beefy.svg';
import Beets from '../assets/logos-ext/beets.svg';
import Coingecko from '../assets/logos-ext/coingecko.svg';
import Debridge from '../assets/logos-ext/debridge.svg';
import Defillama from '../assets/logos-ext/defillama.svg';
import Discord from '../assets/logos-ext/discord.svg';
import ElizaOS from '../assets/logos-ext/elizaos.svg';
import GeckoTerminal from '../assets/logos-ext/geckoterminal.svg';
import InitCapital from '../assets/logos-ext/initcapital.svg';
import Lendle from '../assets/logos-ext/lendle.svg';
import MantleNetwork from '../assets/logos-ext/mantlenetwork.svg';
import MerchantMoe from '../assets/logos-ext/merchant-moe.svg';
import MethProtocol from '../assets/logos-ext/methprotocol.svg';
import N8n from '../assets/logos-ext/n8n.svg';
import Ondo from '../assets/logos-ext/ondo.svg';
import Origin from '../assets/logos-ext/origin.svg';
import Pendle from '../assets/logos-ext/pendle.svg';
import Polygon from '../assets/logos-ext/polygon.svg';
import Shadow from '../assets/logos-ext/shadow.svg';
import Silo from '../assets/logos-ext/silo.svg';
import Sonic from '../assets/logos-ext/sonic.svg';
import SwapX from '../assets/logos-ext/swapx.svg';
import Telegram from '../assets/logos-ext/telegram.svg';
import Wormhole from '../assets/logos-ext/wormhole.svg';
import XDark from '../assets/logos-ext/x_dark.svg';
import Uniswap from '../assets/logos-ext/uniswap.svg';

const logos = [

  { id: "ai16z", src: Ai16z, alt: "Ai16z" },
  { id: "elizaos", src: ElizaOS, alt: "ElizaOS" },
  { id: "n8n", src: N8n, alt: "n8n" },
  { id: "telegram", src: Telegram, alt: "Telegram" },
  { id: "x_dark", src: XDark, alt: "X Dark" },
  { id: "discord", src: Discord, alt: "Discord" },
  { id: "mantlenetwork", src: MantleNetwork, alt: "Mantle Network" },
  { id: "sonic", src: Sonic, alt: "Sonic" },
  { id: "arbitrum", src: Arbitrum, alt: "Arbitrum" },
  { id: "polygon", src: Polygon, alt: "Polygon" },
  { id: "defillama", src: Defillama, alt: "DefiLlama" },
  { id: "geckoterminal", src: GeckoTerminal, alt: "GeckoTerminal" },
  { id: "coingecko", src: Coingecko, alt: "CoinGecko" },
  { id: "wormhole", src: Wormhole, alt: "Wormhole" },
  { id: "debridge", src: Debridge, alt: "deBridge" },
  { id: "uniswap", src: Uniswap, alt: "Uniswap" },
  { id: "aave", src: Aave, alt: "Aave" },
  { id: "beefy", src: Beefy, alt: "Beefy" },
  { id: "beets", src: Beets, alt: "Beets" },
  { id: "initcapital", src: InitCapital, alt: "Init Capital" },
  { id: "lendle", src: Lendle, alt: "Lendle" },
  { id: "merchant-moe", src: MerchantMoe, alt: "Merchant Moe" },
  { id: "methprotocol", src: MethProtocol, alt: "Meth Protocol" },
  { id: "ondo", src: Ondo, alt: "Ondo" },
  { id: "origin", src: Origin, alt: "Origin" },
  { id: "pendle", src: Pendle, alt: "Pendle" },
  { id: "shadow", src: Shadow, alt: "Shadow" },
  { id: "silo", src: Silo, alt: "Silo" },
  { id: "swapx", src: SwapX, alt: "SwapX" },
  { id: "agni", src: Agni, alt: "Agni" },
  
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
