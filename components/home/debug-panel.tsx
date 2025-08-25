"use client";

import { DebugCard } from "@/components/cards/debug-card";
import { shouldShowDebugCard } from "@/lib/debug-utils";
import { Component } from "@/type/component";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { Button } from "../ui/button";

interface DebugPanelProps {
  user: User | null;
}

export const DebugPanel: Component<DebugPanelProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!isOpen) {
    return (
      <Button className="absolute top-0 left-0" onClick={() => setIsOpen(true)}>
        Open Debug Panel
      </Button>
    );
  }

  if (!shouldShowDebugCard(!!user)) return <></>;

  return (
    <div className="w-full md:w-84 border-r-2 md:border-r border-b-2 md:border-b-0 border-red-500 bg-red-50 dark:bg-red-900/10 md:order-first">
      <DebugCard />

      <Button className="absolute top-0 left-0" onClick={() => setIsOpen(false)}>
        Close Debug Panel
      </Button>
    </div>
  );
}; 