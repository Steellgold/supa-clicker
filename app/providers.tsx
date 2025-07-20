"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { BulkBuyProvider } from "@/lib/contexts/bulk-buy-context";
import { GameProvider } from "@/lib/providers/game-provider";
import { AuthProvider } from "@/lib/auth/auth-context";
import { Component } from "@/type/component";
import { PropsWithChildren } from "react";

export const Providers: Component<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <NextThemesProvider
        disableTransitionOnChange
        enableColorScheme
        enableSystem={false}
        attribute="class"
        defaultTheme={"light"}
      >
        <AuthProvider>
          <GameProvider>
            <BulkBuyProvider>
              {children}
            </BulkBuyProvider>
          </GameProvider>
        </AuthProvider>
      </NextThemesProvider>
    </>
  );
};