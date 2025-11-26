"use client";

import React, { useState, useEffect, useRef } from "react";
import { CoinData } from "@/types/coin";
import { Copy, Check, TelegramLogo, Globe, CopySimple } from "phosphor-react";

interface Props {
  items: CoinData[];
}

export function InfiniteCarousel({ items }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // store previous offsets per coin id so we can detect wrap jumps
  const prevOffsetsRef = useRef<Record<string, number>>({});

  const handleCopy = async (contractAddress: string, coinId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopiedId(coinId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!items || items.length === 0) return null;

  // ---- helpers ----

  // circular offset for a given slide index (shortest path around ring)
  const getOffset = (index: number) => {
    const len = items.length;
    let diff = index - activeIndex;

    // normalize
    while (diff > len) diff -= len;
    while (diff < -len) diff += len;

    if (diff > len / 2) diff -= len;
    else if (diff < -len / 2) diff += len;

    return diff;
  };

  // 3D transform based on offset
  const computeTransform = (offset: number) => {
    const absOffset = Math.abs(offset);

    // center card
    if (offset === 0) {
      return {
        transform: "translateX(0px) translateZ(0px) rotateY(0deg) scale(1)",
        opacity: 1,
        zIndex: 50,
      };
    }

    // hide very far cards completely
    if (absOffset >= 4) {
      return {
        transform: "translateX(0px) translateZ(-600px) scale(0.5)",
        opacity: 0,
        zIndex: 0,
        pointerEvents: "none" as const,
      };
    }

    const direction = offset > 0 ? 1 : -1;
    const CARD_GAP = 420;

    const translateX = direction * CARD_GAP * absOffset;
    const translateZ = -(absOffset * 60);
    const rotateY = direction * -18 * Math.min(absOffset, 1.5);
    const scale = Math.max(0.85, 1 - absOffset * 0.1);

    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: 1,
      zIndex: 50 - absOffset * 10,
    };
  };

  const scrollPrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const scrollNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  // wheel -> step slides with animation
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY > 0) scrollNext();
    else if (e.deltaY < 0) scrollPrev();
  };

  // keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // after every activeIndex change, cache current offsets for all coins
  useEffect(() => {
    const map: Record<string, number> = {};
    items.forEach((coin, index) => {
      map[coin.id] = getOffset(index);
    });
    prevOffsetsRef.current = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, items.length]);

  return (
    <div className="relative w-full">
      {/* Left arrow */}
      <button
        onClick={scrollPrev}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
        aria-label="Previous"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* 3D Carousel Container */}
      <div
        className="relative w-full h-[600px] flex items-center justify-center overflow-hidden"
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
        }}
        onWheel={handleWheel}
      >
        {/* 3D Track */}
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((coin, index) => {
            const offset = getOffset(index);
            const absOffset = Math.abs(offset);

            // only bother rendering nearby cards
            if (absOffset >= 6) return null;

            const style = computeTransform(offset);
            const prevOffset =
              prevOffsetsRef.current[coin.id] ?? offset;

            // if this card wrapped from one side to the other,
            // disable transition for this frame so it teleports invisibly
            const isWrapping = Math.abs(offset - prevOffset) > 3;

            const transitionClasses = !isWrapping
              ? "transition-transform transition-opacity duration-500 ease-out"
              : "";

            return (
              <div
                key={coin.id}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer ${transitionClasses}`}
                style={{
                  width: "380px",
                  height: "480px",
                  ...style,
                  pointerEvents: offset === 0 ? "auto" : "none",
                }}
                onClick={() => {
                  if (offset === 0) {
                    window.location.href = `/coin/${coin.contractAddress}`;
                  }
                }}
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl h-full bg-white p-6 flex flex-col">
                  {/* Social Links - Top Left */}
                  <div className="absolute top-6 left-6 flex gap-2">
                    {coin.xLink && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(coin.xLink, '_blank');
                        }}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                        title="X (Twitter)"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </button>
                    )}
                    {coin.telegramLink && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(coin.telegramLink, '_blank');
                        }}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                        title="Telegram"
                      >
                        <TelegramLogo size={16} weight="regular" />
                      </button>
                    )}
                    {coin.websiteLink && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(coin.websiteLink, '_blank');
                        }}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                        title="Website"
                      >
                        <Globe size={16} weight="regular" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(coin.contractAddress || '');
                      }}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      title="Copy contract address"
                    >
                      <CopySimple size={16} weight="regular" className="text-gray-600" />
                    </button>
                  </div>

                  {/* Market Cap - Top Right */}
                  <div className="absolute top-6 right-6">
                    <p className="text-xs font-medium text-gray-400 mb-0.5">MC</p>
                    <p className="text-sm font-bold text-gray-900">
                      ${(coin.marketCap || 0) >= 1000000 
                        ? `${((coin.marketCap || 0) / 1000000).toFixed(1)}M`
                        : `${Math.floor((coin.marketCap || 0) / 1000)}K`}
                    </p>
                  </div>

                  {/* Spacer to push content to center */}
                  <div className="flex-1" />
                  
                  {/* Coin Image and Info */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </div>
                    
                    {/* Coin Info */}
                    <div className="space-y-2 w-full">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900 truncate">
                          {coin.name}
                        </h3>
                        <div className="relative inline-block mt-1">
                          <p className="text-gray-500 font-medium">
                            {coin.ticker}
                          </p>
                        </div>
                      </div>
                      
                      {coin.description && (
                        <p className="text-sm text-gray-600 text-center line-clamp-3 break-words">
                          {coin.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Bottom spacer to center content */}
                  <div className="flex-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right arrow */}
      <button
        onClick={scrollNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
        aria-label="Next"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
