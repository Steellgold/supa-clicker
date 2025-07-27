"use client";

import { useLeaderboard, useUserLeaderboardPosition } from "@/lib/hooks/use-leaderboard";
import { useAuth } from "@/lib/auth/auth-context";
import { LeaderboardType } from "@clicker/game/types";
import { PowerTag } from "@/components/power-tag";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatDecimal } from "@/lib/utils";
import { Trophy, Medal, Crown, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LEADERBOARD_TYPES: { value: LeaderboardType; label: string; icon?: React.ReactNode }[] = [
  { value: "total_power", label: "Total Power" },
  { value: "total_clicks", label: "Total Clicks", icon: <Star className="w-4 h-4" /> },
  { value: "prestige_level", label: "Prestige Level", icon: <Crown className="w-4 h-4" /> },
];

const getPositionIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    case 2:
      return <Medal className="w-4 h-4 text-gray-400" />;
    case 3:
      return <Medal className="w-4 h-4 text-amber-600" />;
    default:
      return null;
  }
};

const getPositionBadge = (position: number) => {
  if (position <= 3) {
    const colors = {
      1: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600",
      2: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-600",
      3: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600",
    };
    return (
      <Badge className={cn("text-xs font-bold", colors[position as keyof typeof colors])}>
        #{position}
      </Badge>
    );
  }
  return <span className="text-sm text-neutral-500 dark:text-neutral-400">#{position}</span>;
};

export const LeaderboardPanel = () => {
  const { user } = useAuth();
  const [activeType, setActiveType] = useState<LeaderboardType>("total_power");
  
  const { leaderboard, isLoading, error, refresh } = useLeaderboard(activeType, 50);
  const { position, userData, isLoading: isLoadingPosition } = useUserLeaderboardPosition(
    user?.id || null,
    activeType
  );

  const formatValue = (entry: any, type: LeaderboardType) => {
    switch (type) {
      case "total_power":
        return (
          <PowerTag imageProps={{ className: "w-4 h-4" }}>
            {formatNumber(entry.total_power)}
          </PowerTag>
        );
      case "total_clicks":
        return formatNumber(entry.total_clicks);
      case "prestige_level":
        return `Level ${entry.prestige_level}`;
      default:
        return formatNumber(entry[type]);
    }
  };

  if (error) {
    return (
      <div className="flex-1 p-3">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>Failed to load leaderboard</p>
          <Button onClick={refresh} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Type selector */}
      <div className="p-3 border-b-2 border-neutral-200 dark:border-neutral-700">
        <div className="flex gap-1">
          {LEADERBOARD_TYPES.map((type) => (
            <Button
              key={type.value}
              variant={activeType === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveType(type.value)}
              className="flex-1 text-xs"
            >
              <div className="flex items-center gap-1">
                {type.icon ? (
                  <>
                    {type.icon}
                    <span className="hidden sm:inline">{type.label}</span>
                  </>
                ) : (
                  <PowerTag imageProps={{ className: "w-4 h-4" }}>
                    <span className="hidden sm:inline">{type.label}</span>
                  </PowerTag>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* User position */}
      {user && !isLoadingPosition && position && position > 0 && (
        <div className="p-3 border-b-2 border-neutral-200 dark:border-neutral-700 bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Your position:</span>
            <div className="flex items-center gap-2">
              {getPositionBadge(position)}
              <span className="text-sm font-medium">
                {userData?.display_name || userData?.username || "You"}
              </span>
            </div>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {formatValue(userData!, activeType)}
          </div>
        </div>
      )}

      {user && !isLoadingPosition && (!position || position === 0) && (
        <div className="p-3 border-b-2 border-neutral-200 dark:border-neutral-700 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="text-center">
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              Sign in to participate in the leaderboard
            </span>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {isLoading ? (
            <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
              Loading leaderboard...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
              No data available
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className={cn(
                  "flex items-center justify-between p-2 border-2 transition-colors",
                  {
                    "border-green-400 bg-green-50 dark:bg-green-900/20": 
                      user?.id === entry.user_id,
                    "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800": 
                      user?.id !== entry.user_id,
                  }
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getPositionIcon(index + 1)}
                    {getPositionBadge(index + 1)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {entry.display_name || entry.username}
                    </span>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatValue(entry, activeType)}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  <div>Prestige: {entry.prestige_level}</div>
                  <div>Achievements: {entry.achievements_count}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}; 