"use client";

import { Menu, Moon, Sun, Trophy } from "lucide-react";
import { useTheme } from "next-themes";
import { ReactElement, useState } from "react";
import { AuthButton } from "./auth/auth-button";
import { AchievementsDialog } from "./dialogs/achievements-dialog";
import { StarButton } from "./star-button";
import { Button } from "./ui/button";

export const Header = (): ReactElement => {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);

  return (
    <header className="border-b-2 border-neutral-800 dark:border-neutral-200 bg-neutral-200/60 dark:bg-neutral-700 p-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="border-1 rounded-none border-neutral-800 dark:border-neutral-200 px-2 py-1 bg-white dark:bg-neutral-900 transition-colors">
          <span className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100 uppercase">SupaClicker</span>
        </div>
        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
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

          <Button 
            variant="retro" 
            size="sm"
            onClick={() => setAchievementsOpen(true)}
          >
            <Trophy className="h-4 w-4" />
          </Button>

          <AuthButton />
          <StarButton />
        </div>

        <Button
          variant="retro"
          size="sm"
          className="md:hidden font-mono font-bold ml-2"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-2 flex flex-col gap-2 bg-neutral-100 dark:bg-neutral-800 p-3 rounded shadow z-50">
          <Button
            variant="retro"
            size="sm"
            className="font-mono font-bold w-full justify-start"
            onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); setMobileMenuOpen(false); }}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="ml-2">Toggle theme</span>
          </Button>

          <Button 
            variant="retro" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => { setAchievementsOpen(true); setMobileMenuOpen(false); }}
          >
            <Trophy className="mr-2 h-4 w-4" />
            Achievements
          </Button>

          <StarButton />

          <AuthButton className="w-full justify-start" />
        </div>
      )}

      {/* Dialogs */}
      <AchievementsDialog open={achievementsOpen} onOpenChange={setAchievementsOpen} />
    </header>
  )
}