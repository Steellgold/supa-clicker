"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Component } from "@/type/component";
import { ReactElement, ReactNode } from "react";

type ConfirmResetDialogProps = {
  children: ReactNode;
  onConfirm: () => void;
}

export const ConfirmResetDialog: Component<ConfirmResetDialogProps> = ({ children, onConfirm }): ReactElement => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Game</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reset your game? This will permanently delete all your progress, including powers, upgrades, and achievements. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Reset Game
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};