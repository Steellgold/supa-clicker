"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Gamepad2, Github, Heart, PartyPopper, Trophy } from "lucide-react";

type FarewellScreenProps = {
  onStart: () => void;
};

const HACKATHON_URL = "https://supabase.com/blog/lw15-hackathon-winners#winner-2";
const STABLE_BRANCH_URL = "https://github.com/Steellgold/supa-clicker/tree/stable";
const HACKATHON_BRANCH_URL = "https://github.com/Steellgold/supa-clicker/tree/hackathon";

export const FarewellScreen = ({ onStart }: FarewellScreenProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl border-2 border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-800 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#aaa] p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <Trophy className="w-10 h-10 mx-auto text-green-600 dark:text-green-400" />
          <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
            Supa Clicker is coming to an end
          </h1>
        </div>

        <div className="space-y-4 text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
          <p>
            Here you go, thank you for using Supa Clicker. This project won the{" "}
            <span className="font-bold text-green-700 dark:text-green-400">Supabase Hackathon</span>{" "}
            (
            <a
              href={HACKATHON_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-green-700 dark:hover:text-green-400 break-all"
            >
              supabase.com/blog/lw15-hackathon-winners
            </a>
            ). Thank you all for using the project.
          </p>

          <p>
            It obviously stays open-source, for anyone who wants to try it at home (
            <a
              href={STABLE_BRANCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-green-700 dark:hover:text-green-400 break-all"
            >
              github.com/Steellgold/supa-clicker/tree/stable
            </a>
            ) and keep clicking on pure SUPA x)
          </p>

          <div className="border-2 border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 p-3 flex items-start gap-3">
            <Heart className="w-4 h-4 mt-1 shrink-0 text-red-500" />
            <p className="text-xs md:text-sm">
              Multiplayer (leaderboard &amp; chat) is now disabled and your progress is saved
              straight into your browser — the game stays fully playable in singleplayer. The
              complete version with the socket server is still available on the{" "}
              <a
                href={HACKATHON_BRANCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-green-700 dark:hover:text-green-400"
              >
                hackathon branch
              </a>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <Button
            variant="retro"
            size="lg"
            onClick={onStart}
            className={cn("w-full sm:w-auto px-8 py-4 text-base gap-2")}
          >
            <Gamepad2 className="w-5 h-5" />
            Play (Singleplayer)
          </Button>

          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <Github className="w-3.5 h-3.5" />
              Open-source
            </span>
            <span className="flex items-center gap-1">
              <PartyPopper className="w-3.5 h-3.5" />
              100% SUPA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
