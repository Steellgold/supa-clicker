import { usePrestigeStats } from "@/lib/hooks/use-prestige-stats";
import { formatNumber } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface PrestigeStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};

export function PrestigeStatsDialog({ open, onOpenChange }: PrestigeStatsDialogProps) {
  const { summary, currentStats, isLoading, getPrestigeLevelStats, refreshSummary } = usePrestigeStats();
  const [selectedPrestigeLevel, setSelectedPrestigeLevel] = useState<number | null>(null);

  // Request data when dialog opens
  useEffect(() => {
    if (open) {
      refreshSummary();
    }
  }, [open]); // Request data every time dialog opens

  const handlePrestigeLevelClick = (level: number) => {
    setSelectedPrestigeLevel(level);
    getPrestigeLevelStats(level);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prestige Statistics</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading statistics...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Prestiges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.total_prestiges}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Time Played</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatDuration(summary.total_time_played)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Power Earned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(summary.total_power_earned)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(summary.total_clicks)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Upgrades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(summary.total_upgrades_purchased)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Prestige Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatDuration(summary.average_prestige_duration)}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Prestige Level Buttons */}
            {summary && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Session Details</h3>
                <div className="flex flex-wrap gap-2">
                  {/* Current Session Button */}
                  <Button
                    variant={selectedPrestigeLevel === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedPrestigeLevel(null);
                      // Show current session stats
                    }}
                  >
                    Current Session
                  </Button>
                  
                  {/* Prestige Level Buttons */}
                  {Array.from({ length: summary.total_prestiges }, (_, i) => (
                    <Button
                      key={i}
                      variant={selectedPrestigeLevel === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePrestigeLevelClick(i)}
                    >
                      Prestige {i}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Stats for Selected Session/Prestige Level */}
            {selectedPrestigeLevel !== null && currentStats ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Prestige {selectedPrestigeLevel} Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{formatDuration(currentStats.duration_seconds)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Power Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{formatNumber(currentStats.total_power_earned)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{formatNumber(currentStats.total_clicks)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Upgrades Purchased</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{currentStats.upgrades_purchased}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Power Spent on Upgrades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{formatNumber(currentStats.power_spent_on_upgrades)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Max PPS Reached</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{formatNumber(currentStats.max_pps_reached)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Max PPC Reached</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{formatNumber(currentStats.max_ppc_reached)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Achievements Unlocked</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{currentStats.achievements_unlocked.length}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Final Upgrades */}
                {currentStats.final_upgrades.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Final Upgrades</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {currentStats.final_upgrades.map((upgrade, index) => (
                        <div key={index} className="p-2 bg-gray-100 rounded text-sm">
                          <div className="font-medium">Upgrade {upgrade.id}</div>
                          <div className="text-muted-foreground">Level {upgrade.level}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {summary && selectedPrestigeLevel === null && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Current Session Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Session Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatDuration(summary.total_time_played)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Power Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(summary.total_power_earned)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(summary.total_clicks)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Upgrades Purchased</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(summary.total_upgrades_purchased)}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-center py-4 text-muted-foreground">
                  Perform your first prestige to see detailed prestige-level statistics!
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 