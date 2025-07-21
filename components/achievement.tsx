import { cn } from "@/lib/utils";
import { Component } from "@/type/component";

type AchievementProps = {
  name: string;
  icon: string;
};

export const Achievement: Component<AchievementProps> = ({ name, icon }) => (
  <div className={cn(
    "absolute bottom-5 left-1/2 transform -translate-x-1/2 z-50",
    "bg-[#c8facc] border-4 border-[#3a7758] rounded-none px-6 py-4 shadow-[4px_4px_0_#3a7758]",
    "w-[90vw] max-w-md font-mono text-sm text-black"
  )}>
    <div className="flex items-center gap-4">
      <span className="text-2xl bg-[#91dca3] border-2 border-[#3a7758] px-3 py-2">{icon}</span>

      <div className="flex flex-col leading-tight">
        <p className="font-bold text-[#1f5c42] text-base">Achievement Unlocked!</p>
        <p className="text-[#2f6b4f] text-sm">{name}</p>
      </div>
    </div>
  </div>
);