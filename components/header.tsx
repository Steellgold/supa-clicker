"use client";

import { Moon, Sun, Trophy } from "lucide-react";
import { useTheme } from "next-themes";
import { ReactElement } from "react";
import { AchievementsDialog } from "./achievements-dialog";
import { AuthButton } from "./auth/auth-button";
import { Button } from "./ui/button";

export const Header = (): ReactElement => {
  const { theme, setTheme } = useTheme();

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

          <AuthButton />
        </div>
      </div>
    </header>
  )
}