"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useLeaderboard } from "@/lib/hooks/use-leaderboard";
import { cn } from "@/lib/utils";
import { LeaderboardEntry, LeaderboardType } from "@/type/leaderboard";
import { ReactElement, useState } from "react";
import { Button } from "../ui/button";
import { UserProfileLink } from "../user-profile-link";

const LEADERBOARD_TYPES: { key: LeaderboardType; label: string; symbol: string }[] = [
  { key: "total_power", label: "Power", symbol: "⚡" },
  { key: "total_clicks", label: "Clicks", symbol: "👆" },
  { key: "prestige_level", label: "Prestige", symbol: "👑" },
];

export const LeaderboardTab = (): ReactElement => {
  const [activeType, setActiveType] = useState<LeaderboardType>("total_power");
  const { user } = useAuth();
  
  const { leaderboard, isLoading, error, fetchLeaderboard } = useLeaderboard(activeType, 20);

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  const getValueForType = (entry: LeaderboardEntry, type: LeaderboardType): number => {
    switch (type) {
      case "total_clicks": return entry.total_clicks || 0;
      case "total_power": return entry.total_power || 0;
      case "prestige_level": return entry.prestige_level || 0;
      default: return 0;
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="space-y-3">
      {/* Header avec titre */}
      <div className="border-2 border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-900 p-3">
        <h2 className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100 uppercase text-center">
          🏆 HIGH SCORES
        </h2>
      </div>
      
      {/* Type selector */}
      <div className="grid grid-cols-3 gap-2">
        {LEADERBOARD_TYPES.map((type) => (
          <Button
            key={type.key}
            onClick={() => setActiveType(type.key)}
            variant="retro"
            size="sm"
            className={cn(
              "font-mono text-xs transition-colors",
              activeType === type.key
                ? "bg-yellow-400 text-neutral-900"
                : "bg-neutral-300 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300"
            )}
          >
            <span>{type.symbol}</span>
            <span className="ml-1">{type.label}</span>
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="border-2 border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-900 p-2 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
              LOADING...
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <div className="border-2 border-red-600 bg-red-100 dark:bg-red-900 p-2 mb-2">
              <div className="font-mono text-xs text-red-800 dark:text-red-200">
                ERROR: {error}
              </div>
            </div>
            <Button
              onClick={() => fetchLeaderboard(user?.id)}
              variant="retro"
              size="sm"
            >
              RETRY
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <div className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
                  NO DATA
                </div>
              </div>
            ) : (
              leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = user?.id === entry.user_id;
                const value = getValueForType(entry, activeType);

                return (
                  <div
                    key={entry.user_id}
                    className={cn(
                      "border-2 p-2 transition-colors font-mono text-xs",
                      isCurrentUser
                        ? "border-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 text-neutral-900 dark:text-yellow-100"
                        : "border-neutral-600 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold w-8">
                          {getRankDisplay(rank)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-bold">
                            {entry.username ? (
                              <UserProfileLink
                                username={entry.username}
                                displayName={entry.display_name}
                                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                              >
                                <span>
                                  {entry.display_name || entry.username}
                                  {isCurrentUser && <span className="ml-1">(YOU)</span>}
                                </span>
                              </UserProfileLink>
                            ) : (
                              <span>
                                Anonymous
                                {isCurrentUser && <span className="ml-1">(YOU)</span>}
                              </span>
                            )}
                          </div>
                          {entry.prestige_level > 0 && (
                            <div className="text-purple-600 dark:text-purple-400">
                              PRESTIGE-{entry.prestige_level}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right font-bold">
                        {activeType === "prestige_level" 
                          ? `LV.${value}` 
                          : formatNumber(value)
                        }
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <Button
        onClick={() => fetchLeaderboard(user?.id)}
        variant="retro"
        size="sm"
        className="w-full font-mono text-xs"
      >
        🔄 REFRESH
      </Button>
    </div>
  );
};