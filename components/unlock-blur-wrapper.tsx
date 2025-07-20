"use client";

import { PropsWithChildren } from "react";
import { useGame } from "@/lib/providers/game-provider";
import { Component } from "@/type/component";

type UnlockBlurWrapperProps = PropsWithChildren & {
  isUnlocked: boolean;
  index: number;
  getUnlockedCount: (totalPower: number) => number;
  maxDistance?: number;
}

export const UnlockBlurWrapper: Component<UnlockBlurWrapperProps> = ({ children, isUnlocked, index, getUnlockedCount, maxDistance = 4 }) => {
  const { gameState } = useGame();

  const getVisualEffect = () => {
    if (isUnlocked) return { opacity: 1, blur: 0 };
    
    const unlockedCount = getUnlockedCount(gameState.totalPower);
    const distanceFromUnlocked = index - unlockedCount;
    
    if (distanceFromUnlocked > maxDistance) return { opacity: 0, blur: 10 };
    
    const opacityStep = 0.7 / maxDistance;
    const blurStep = 8 / maxDistance;
    
    return {
      opacity: Math.max(0.1, 1 - (distanceFromUnlocked * opacityStep)),
      blur: distanceFromUnlocked * blurStep
    };
  };

  const { opacity, blur } = getVisualEffect();
  if (blur > 6) return <></>;

  return (
    <div
      style={{ 
        opacity,
        filter: `blur(${blur}px)`,
        transform: blur > 5 ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 0.3s ease'
      }}
    >
      {children}
    </div>
  );
};