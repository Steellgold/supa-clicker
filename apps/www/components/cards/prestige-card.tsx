// "use client";

// import { PowerTag } from "@/components/power-tag";
// import { Card } from "@/components/ui/card";
// import { getPrestigeImageUrl } from "@/lib/config/prestige-images";
// import { canPrestige, getPrestigeEstimates, getPrestigeRequirement, performPrestige } from "@/lib/prestige";
// import { useGame } from "@/lib/providers/game-provider";
// import { cn, formatNumber } from "@/lib/utils";
// import { Component } from "@/type/component";
// import Image from "next/image";
// import { PrestigeConfirmationDialog } from "../dialogs/prestige-confirmation-dialog";

// export const PrestigeCard: Component<object> = () => {
//   const { gameState, setGameState } = useGame();

//   if (gameState.prestigeLevel >= 50) {
//     const maxPrestigeImageUrl = getPrestigeImageUrl(50);
//     const currentMultiplier = getPrestigeEstimates(gameState).currentMultiplier;
    
//     return (
//       <Card className="rounded-none p-3 border-1 transition-colors mb-0 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             {/* Max Level Icon */}
//             <div className="w-10 h-10 flex items-center justify-center text-yellow-600">
//               {maxPrestigeImageUrl ? (
//                 <Image
//                   src={maxPrestigeImageUrl}
//                   alt="Max Prestige"
//                   className="object-contain pixelated"
//                   width={40}
//                   height={40}
//                 />
//               ) : (
//                 <div className="text-2xl">👑</div>
//               )}
//             </div>

//             <div>
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-300 text-xs px-1.5 py-0.5 border border-yellow-400 dark:border-yellow-600 font-bold">
//                   LV.{gameState.prestigeLevel}
//                 </span>
//                 <h3 className="font-semibold text-sm text-yellow-800 dark:text-yellow-200">
//                   Prestige Mastery
//                 </h3>
//               </div>

//               <p className="text-xs text-yellow-700 dark:text-yellow-300">
//                 {formatNumber(currentMultiplier)}x Multiplier
//               </p>
//             </div>
//           </div>

//           <div className="bg-gradient-to-r from-orange-400 to-orange-300 text-white text-sm font-bold px-2 py-1 flex items-center gap-2">
//             <span>COMPLETED</span>
//           </div>
//         </div>
//       </Card>
//     );
//   }

//   const canDoPrestige = canPrestige(gameState);
//   const requirement = getPrestigeRequirement(gameState.prestigeLevel);
//   const estimates = getPrestigeEstimates(gameState);
//   const prestigeImageUrl = getPrestigeImageUrl(estimates.newLevel);
//   const nextPrestigeLevel = gameState.prestigeLevel + 1;

//   const handlePrestige = () => {
//     if (canDoPrestige) {
//       const newGameState = performPrestige(gameState);
//       setGameState(newGameState);
//     }
//   };

//   return (
//     <Card className={cn(
//       "rounded-none p-3 border-1 transition-colors mb-0 bg-gradient-to-r", {
//         "border-purple-300 from-purple-50 to-yellow-50 dark:from-purple-900/20 dark:to-yellow-900/20": canDoPrestige,
//         "border-purple-300 dark:border-purple-600": !canDoPrestige
//       }
//     )}>
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           {/* Simple Icon */}
//           <div className={cn(
//             "w-12 h-12 flex items-center justify-center bg-purple-500/20 dark:bg-purple-900/20 p-1 border-2 border-purple-500/20 dark:border-purple-900/20",
//           )}>
//             <Image
//               src={prestigeImageUrl}
//               alt="Prestige"
//               className="object-contain pixelated"
//               width={40}
//               height={40}
//             />
//           </div>

//           <div>
//             <div className="flex items-center gap-2 mb-1">
//               {gameState.prestigeLevel > 0 && (
//                 <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-1.5 py-0.5 border border-purple-300 dark:border-purple-600">
//                   Lv.{gameState.prestigeLevel}
//                 </span>
//               )}
//               <h3 className={cn(
//                 "font-semibold text-sm",
//                 canDoPrestige ? "text-purple-800 dark:text-purple-200" : "text-neutral-800 dark:text-neutral-200"
//               )}>
//                 Prestige
//                 {nextPrestigeLevel == 1 && (
//                   <span className="text-xs bg-purple-800/20 dark:bg-purple-700/20 text-purple-800 dark:text-purple-200 border border-purple-800/20 dark:border-purple-700/20 rounded-sm px-1 py-0.1 ml-1">
//                     {nextPrestigeLevel}
//                   </span>
//                 )}
//               </h3>
//             </div>

//             {canDoPrestige ? (
//               <p className="text-xs text-purple-700 dark:text-purple-300">
//                 Bonus: {formatNumber(estimates.currentMultiplier)}x → {formatNumber(estimates.newMultiplier)}x
//               </p>
//             ) : (
//               <div className="-mt-1">
//                 <PowerTag imageProps={{ width: 10, height: 10, className: "mb-0.5 ml-1 neutralscale" }}>
//                   <span className="text-xs">Need {formatNumber(requirement)}</span>
//                 </PowerTag>

//                 <div className="w-32 bg-neutral-200 dark:bg-neutral-700 h-1">
//                   <div
//                     className="h-1 bg-purple-500 transition-all"
//                     style={{
//                       width: `${Math.min(100, (gameState.currentPower / requirement) * 100)}%`
//                     }}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {canDoPrestige ? (
//           <PrestigeConfirmationDialog gameState={gameState} onConfirm={handlePrestige}>
//             <button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-bold px-4 py-2 transition-all uppercase">
//               Upgrade
//             </button>
//           </PrestigeConfirmationDialog>
//         ) : (
//           <div className="px-1.5 py-0 bg-purple-500/20 jedark:bg-purple-900/20 rounded-xs border border-purple-500/20 dark:border-purple-900/20">
//             <span className="text-xs text-purple-500 dark:text-purple-400 font-bold">
//               {((gameState.currentPower / requirement) * 100).toFixed(1)}%
//             </span>
//           </div>
//         )}
//       </div>
//     </Card>
//   );
// };