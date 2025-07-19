"use client";

import { Trophy } from "lucide-react";
import { ReactElement } from "react";
import { Button } from "./ui/button";
import { AuthButton } from "./auth/auth-button";

export const Header = (): ReactElement => {
  return (
    <header className="border-b-2 border-neutral-800 dark:border-neutral-200 bg-neutral-200/60 dark:bg-neutral-700 p-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="border-1 rounded-none border-neutral-800 dark:border-neutral-200 px-2 py-1 bg-white dark:bg-neutral-900 transition-colors">
          <span className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100 uppercase">SupaClicker</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="retro" size="sm">
            <Trophy />
          </Button>

          <AuthButton />
        </div>
      </div>
    </header>
  )
}