"use client";

import React, { createContext, useContext, useState, PropsWithChildren } from 'react';
import { Component } from '@/type/component';

export type BulkBuyOption = 1 | 3 | 5 | 10 | 20 | "MAX";

type BulkBuyContextType = {
  bulkBuyOption: BulkBuyOption;
  setBulkBuyOption: (option: BulkBuyOption) => void;
  isBulkBuyUnlocked: boolean;
}

const BulkBuyContext = createContext<BulkBuyContextType | null>(null);

export const BulkBuyProvider: Component<PropsWithChildren> = ({ children }) => {
  const [bulkBuyOption, setBulkBuyOption] = useState<BulkBuyOption>(1);

  return (
    <BulkBuyContext.Provider value={{ 
      bulkBuyOption, 
      setBulkBuyOption,
      isBulkBuyUnlocked: true // Always unlocked by default
    }}>
      {children}
    </BulkBuyContext.Provider>
  );
};

export const useBulkBuy = (): BulkBuyContextType => {
  const context = useContext(BulkBuyContext);
  
  if (!context) {
    throw new Error('useBulkBuy must be used within a BulkBuyProvider');
  }
  
  return context;
};
