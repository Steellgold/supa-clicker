"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useGame } from "@/lib/providers/game-provider";
import { Check, Moon, Save, Star, Sun, Trophy, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ReactElement, useEffect, useState } from "react";
import { AchievementsDialog } from "./achievements-dialog";
import { AuthButton } from "./auth/auth-button";
import { Button, buttonVariants } from "./ui/button";

export const Header = (): ReactElement => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { saveGame } = useGame();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [githubStars, setGithubStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/Steellgold/supa-clicker")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.stargazers_count === "number") {
          setGithubStars(data.stargazers_count);
        }
      })
      .catch(() => setGithubStars(null));
  }, []);

  const handleManualSave = async () => {
    if (saveState === 'saving') return;
    
    setSaveState('saving');
    try {
      const success = await saveGame();
      setSaveState(success ? 'success' : 'error');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (error) {
      console.error('Manual save failed:', error);
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 2000);
    }
  };

  return (
    <header className="border-b-2 border-neutral-800 dark:border-neutral-200 bg-neutral-200/60 dark:bg-neutral-700 p-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="border-1 rounded-none border-neutral-800 dark:border-neutral-200 px-2 py-1 bg-white dark:bg-neutral-900 transition-colors">
          <span className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100 uppercase">SupaClicker</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="retro"
            size="sm"
            className="font-mono font-bold"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <AchievementsDialog>
            <Button variant="retro" size="sm">
              <Trophy />
            </Button>
          </AchievementsDialog>

          {user && (
            <Button
              variant="retro"
              size="sm"
              className="font-mono font-bold"
              onClick={handleManualSave}
              disabled={saveState === 'saving'}
            >
              {saveState === 'saving' && <div className="h-[1.2rem] w-[1.2rem] animate-spin rounded-full border-2 border-transparent border-t-current" />}
              {saveState === 'success' && <Check className="h-[1.2rem] w-[1.2rem] text-green-600" />}
              {saveState === 'error' && <X className="h-[1.2rem] w-[1.2rem] text-red-600" />}
              {saveState === 'idle' && <Save className="h-[1.2rem] w-[1.2rem]" />}
              <span className="sr-only">Manual save</span>
            </Button>
          )}

          <AuthButton />

          <Link
            href="https://github.com/Steellgold/supa-clicker"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "retro",
              size: "sm",
              className: "font-mono font-bold"
            })}
            title="View the GitHub repository"
          >
            <Star className="w-4 h-4 mr-1" fill="#eab308" />
            <span>Star</span>
            {githubStars !== null && (
              <span className="ml-1">{githubStars}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}