"use client";
import { User as UserIcon } from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const TABS = [
  { key: "total_power", label: "Total Power" },
  { key: "total_clicks", label: "Total Clicks" },
  { key: "prestige_level", label: "Prestige" },
];

type LeaderboardEntry = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  total_power: number;
  total_clicks: number;
  prestige_level: number;
};

function useLeaderboard(type = "total_power", limit = 50) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setIsLoading(true);
    fetch(`/api/leaderboard?type=${type}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data.leaderboard || []);
        setError(data.error || null);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Network error");
        setIsLoading(false);
      });
  }, [type, limit]);

  return { leaderboard, isLoading, error };
}

export default function Leaderboard() {
  const [type, setType] = useState("total_power");
  const { leaderboard, isLoading, error } = useLeaderboard(type);

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex gap-2 mb-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`px-3 py-1 rounded ${type === tab.key ? "bg-yellow-400 font-bold" : "bg-neutral-200"}`}
            onClick={() => setType(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="text-center text-neutral-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <div className="text-center text-neutral-400">No entries yet.</div>
          ) : (
            leaderboard.map((entry, i) => (
              <div key={entry.user_id} className="flex items-center gap-3 border p-2 rounded bg-white dark:bg-neutral-900">
                <span className="w-6 text-right">{i + 1}</span>
                <Avatar>
                  {entry.avatar_url ? (
                    <AvatarImage src={entry.avatar_url} alt={entry.display_name || entry.username || "Anonymous"} />
                  ) : (
                    <AvatarFallback>
                      <UserIcon className="w-4 h-4 text-neutral-400" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-semibold">{entry.display_name || entry.username || "Anonymous"}</span>
                <span className="ml-auto">
                  {type === "total_power" && entry.total_power}
                  {type === "total_clicks" && entry.total_clicks}
                  {type === "prestige_level" && entry.prestige_level}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}