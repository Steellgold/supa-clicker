/**
 * Wtf ? Claude Code is amazing ????
 */

"use client";

import { SPECIAL_ITEM_IDS } from "@/lib/constants/special-items";
import { useGame } from "@/lib/providers/game-provider";
import { Component } from "@/type/component";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface Duck {
  id: string;
  x: number;
  variant: string;
  reward: number;
  speed: number;
}

type DuckWalkerProps = {
  maxX: number;
};

const DUCK_VARIANTS = [
  { file: "duck.svg", baseReward: 50, speed: 1.0, name: "classic", weight: 30 },
  { file: "golden-duck.svg", baseReward: 1500, speed: 1.3, name: "golden", weight: 20 },
  { file: "duck-with-briefcase.svg", baseReward: 6000, speed: 1.0, name: "briefcase", weight: 10 },
  { file: "duck-flash.svg", baseReward: 570, speed: 2.0, name: "flash", weight: 25 },
  { file: "duck-on-turtle.svg", baseReward: 250, speed: 0.5, name: "turtle", weight: 15 },
];

export const DuckWalker: Component<DuckWalkerProps> = ({ maxX }) => {
  const { specialItemsState, addPower } = useGame();
  const [ducks, setDucks] = useState<Duck[]>([]);

  const rubberDuckLevel = specialItemsState[SPECIAL_ITEM_IDS.DUCK_WALKER] || 0;

  const getDuckSpawnConfig = useCallback((level: number) => {
    switch (level) {
      case 1: return { chancePerMinute: 0.1, minDucks: 1, maxDucks: 2 };
      case 2: return { chancePerMinute: 0.25, minDucks: 1, maxDucks: 3 };
      case 3: return { chancePerMinute: 0.5, minDucks: 1, maxDucks: 4 };
      case 4: return { chancePerMinute: 0.75, minDucks: 2, maxDucks: 4 };
      case 5: return { chancePerMinute: 0.9, minDucks: 3, maxDucks: 4 };
      default: return { chancePerMinute: 0, minDucks: 0, maxDucks: 0 };
    }
  }, []);

  const getRandomDuckVariant = useCallback(() => {
    const totalWeight = DUCK_VARIANTS.reduce((sum, variant) => sum + variant.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const variant of DUCK_VARIANTS) {
      random -= variant.weight;
      if (random <= 0) {
        return variant;
      }
    }
    
    return DUCK_VARIANTS[0]; // fallback
  }, []);

  const spawnDucks = useCallback(() => {
    if (rubberDuckLevel === 0) return;

    const config = getDuckSpawnConfig(rubberDuckLevel);
    const shouldSpawn = Math.random() < config.chancePerMinute / 60;

    if (shouldSpawn) {
      const duckCount = Math.floor(Math.random() * (config.maxDucks - config.minDucks + 1)) + config.minDucks;
      const newDucks: Duck[] = [];

      for (let i = 0; i < duckCount; i++) {
        const variant = getRandomDuckVariant();
        const baseReward = variant.baseReward;
        const levelMultiplier = rubberDuckLevel >= 3 ? 1.5 : rubberDuckLevel >= 5 ? 2 : 1;
        
        newDucks.push({
          id: `duck-${Date.now()}-${i}`,
          x: -100 - (i * 50),
          variant: variant.file,
          reward: baseReward * levelMultiplier,
          speed: variant.speed + Math.random() * 0.2,
        });
      }

      setDucks(prev => [...prev, ...newDucks]);
    }
  }, [rubberDuckLevel, getDuckSpawnConfig, getRandomDuckVariant]);

  const handleDuckClick = useCallback((duck: Duck) => {
    addPower(duck.reward);
    setDucks(prev => prev.filter(d => d.id !== duck.id));
  }, [addPower]);

  // Spawn ducks every second
  useEffect(() => {
    if (rubberDuckLevel === 0) return;

    const spawnInterval = setInterval(spawnDucks, 1000);
    return () => clearInterval(spawnInterval);
  }, [spawnDucks, rubberDuckLevel]);

  // Animate ducks movement
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setDucks(prev => 
        prev
          .map(duck => ({
            ...duck,
            x: duck.x + duck.speed
          }))
            .filter(duck => duck.x < (maxX || 800))
      );
    }, 16);

    return () => clearInterval(animationInterval);
  }, [maxX]);

  if (rubberDuckLevel === 0) return <></>;

  return (
    <div className="fixed left-0 w-full h-14 pointer-events-none z-30 overflow-hidden bottom-0">
      {ducks.map(duck => (
        <div
          key={duck.id}
          className="absolute bottom-2 pointer-events-auto cursor-pointer transform hover:scale-110 transition-transform"
          style={{
            left: `${duck.x}px`,
            transform: `translateX(0px)`,
          }}
          onClick={() => handleDuckClick(duck)}
        >
          <Image
            src={`/ducks/${duck.variant}`}
            alt="Walking duck"
            className="w-12 h-12"
            style={{
              animation: "duckWalk 0.8s infinite ease-in-out",
            }}
            width={48}
            height={48}
          />
        </div>
      ))}
    </div>
  );
};