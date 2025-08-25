export const isBulkBuyUnlocked = (): boolean => {
  return true; // Bulk buy is now always unlocked
};

export const calculateMaxAffordable = (baseCost: number, costGrowth: number, currentLevel: number, currentPower: number): number => {
  let maxQuantity = 0;
  let totalCost = 0;
  
  for (let i = 0; i < 1000; i++) { // max 1000
    const cost = Math.floor(baseCost * Math.pow(costGrowth, currentLevel + i));
    if (currentPower >= totalCost + cost) {
      totalCost += cost;
      maxQuantity++;
    } else {
      break;
    }
  }
  
  return maxQuantity;
};