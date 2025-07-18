import { Trophy } from "lucide-react";
import { ReactElement } from "react";
import { Button } from "./ui/button";

export const Header = (): ReactElement => {
  return (
    <header className="border-b-2 border-neutral-800 dark:border-neutral-200 bg-neutral-200/60 dark:bg-neutral-700 p-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="border-2 border-neutral-800 dark:border-neutral-200 rounded-lg px-4 py-1 bg-white dark:bg-neutral-900 transition-colors">
          <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 uppercase">SupaClicker</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="retro" size="sm">
            <Trophy />
          </Button>
        </div>
      </div>
    </header>
  )
}