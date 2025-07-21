import { SpecialItem } from "@/type/game";
import { SPECIAL_ITEM_CATEGORIES, SPECIAL_ITEM_EFFECTS, SPECIAL_ITEM_IDS } from "./constants/special-items";
import { UPGRADE_IDS } from "./constants/upgrades";
import { getUpgradeById } from "./upgrades";

export const SPECIAL_ITEMS: SpecialItem[] = [
  {
    id: SPECIAL_ITEM_IDS.BULK_PURCHASE_SYSTEM,
    name: "Bulk Purchase System",
    description: "Unlock the ability to buy multiple upgrades at once",
    baseCost: 50000,
    costGrowth: 1.0,
    effect: SPECIAL_ITEM_EFFECTS.BULK_BUY_FEATURE,
    multiplier: 1,
    category: SPECIAL_ITEM_CATEGORIES.SPECIAL,
    unlockRequirement: 40000,
    maxPurchases: 1,
    isFeatureUnlock: true,
  },
  
  {
    id: SPECIAL_ITEM_IDS.AI_TRAINING_PLUS,
    name: "AI Training+",
    description: "Double the efficiency of AI Interns",
    baseCost: 1000,
    costGrowth: 2.0,
    effect: SPECIAL_ITEM_EFFECTS.AI_INTERN_BOOST,
    multiplier: 2,
    category: SPECIAL_ITEM_CATEGORIES.UPGRADE_BOOST,
    unlockRequirement: 500,
    maxPurchases: 1,
    isFeatureUnlock: true,
  },
  {
    id: SPECIAL_ITEM_IDS.DEV_CERTIFICATION,
    name: "Dev Certification",
    description: "Triple the efficiency of Junior Devs",
    baseCost: 5000,
    costGrowth: 2.0,
    effect: SPECIAL_ITEM_EFFECTS.JUNIOR_DEV_BOOST,
    multiplier: 3,
    category: SPECIAL_ITEM_CATEGORIES.UPGRADE_BOOST,
    unlockRequirement: 1000,
  },
  {
    id: SPECIAL_ITEM_IDS.KUBERNETES_MASTER,
    name: "Kubernetes Master",
    description: "Double the efficiency of DevOps",
    baseCost: 15000,
    costGrowth: 2.0,
    effect: SPECIAL_ITEM_EFFECTS.DEVOPS_BOOST,
    multiplier: 2,
    category: SPECIAL_ITEM_CATEGORIES.UPGRADE_BOOST,
    unlockRequirement: 2000,
  },
  {
    id: SPECIAL_ITEM_IDS.CLOUD_CERTIFICATION,
    name: "Cloud Certification",
    description: "x1.5 all cloud upgrades",
    baseCost: 50000,
    costGrowth: 2.0,
    effect: SPECIAL_ITEM_EFFECTS.CLOUD_BOOST,
    multiplier: 1.5,
    category: SPECIAL_ITEM_CATEGORIES.UPGRADE_BOOST,
    unlockRequirement: 3000,
  },
  {
    id: SPECIAL_ITEM_IDS.ML_EXPERTISE,
    name: "ML Expertise",
    description: "x3 all AI/ML upgrades",
    baseCost: 200000,
    costGrowth: 2.0,
    effect: SPECIAL_ITEM_EFFECTS.AI_ML_BOOST,
    multiplier: 3,
    category: SPECIAL_ITEM_CATEGORIES.UPGRADE_BOOST,
    unlockRequirement: 5000,
  },

  // Global Multipliers - Tier 1
  {
    id: SPECIAL_ITEM_IDS.SUPABASE_PRO,
    name: "Supabase Pro",
    description: "Multiply all gains by 1.5",
    baseCost: 100000,
    costGrowth: 3.0,
    effect: SPECIAL_ITEM_EFFECTS.GLOBAL_1_5X,
    multiplier: 1.5,
    category: SPECIAL_ITEM_CATEGORIES.GLOBAL,
    unlockRequirement: 2500,
  },
  {
    id: SPECIAL_ITEM_IDS.ENTERPRISE_PLAN,
    name: "Enterprise Plan",
    description: "Multiply all gains by 2",
    baseCost: 500000,
    costGrowth: 3.0,
    effect: SPECIAL_ITEM_EFFECTS.GLOBAL_2X,
    multiplier: 2,
    category: SPECIAL_ITEM_CATEGORIES.GLOBAL,
    unlockRequirement: 5000,
  },
  {
    id: SPECIAL_ITEM_IDS.UNICORN_STATUS,
    name: "Unicorn Status",
    description: "Multiply all gains by 3",
    baseCost: 2000000,
    costGrowth: 3.0,
    effect: SPECIAL_ITEM_EFFECTS.GLOBAL_3X,
    multiplier: 3,
    category: SPECIAL_ITEM_CATEGORIES.GLOBAL,
    unlockRequirement: 10000,
  },
  {
    id: SPECIAL_ITEM_IDS.IPO,
    name: "IPO",
    description: "Multiply all gains by 5",
    baseCost: 10000000,
    costGrowth: 3.0,
    effect: SPECIAL_ITEM_EFFECTS.GLOBAL_5X,
    multiplier: 5,
    category: SPECIAL_ITEM_CATEGORIES.GLOBAL,
    unlockRequirement: 25000,
  },
  {
    id: SPECIAL_ITEM_IDS.TECH_MONOPOLY,
    name: "Tech Monopoly",
    description: "Multiply all gains by 10",
    baseCost: 100000000,
    costGrowth: 3.0,
    effect: SPECIAL_ITEM_EFFECTS.GLOBAL_10X,
    multiplier: 10,
    category: SPECIAL_ITEM_CATEGORIES.GLOBAL,
    unlockRequirement: 50000,
    maxPurchases: 1,
  },

  // Special Effects - Tier 1
  {
    id: SPECIAL_ITEM_IDS.GOLDEN_CLICK,
    name: "Golden Click",
    description: "1% chance for click x100",
    baseCost: 25000,
    costGrowth: 2.5,
    effect: SPECIAL_ITEM_EFFECTS.GOLDEN_CLICK,
    multiplier: 1,
    category: SPECIAL_ITEM_CATEGORIES.SPECIAL,
    unlockRequirement: 3000,
  },
  {
    id: SPECIAL_ITEM_IDS.LUCKY_STREAK,
    name: "Lucky Streak",
    description: "2% chance for click x50",
    baseCost: 75000,
    costGrowth: 2.5,
    effect: SPECIAL_ITEM_EFFECTS.LUCKY_STREAK,
    multiplier: 1,
    category: SPECIAL_ITEM_CATEGORIES.SPECIAL,
    unlockRequirement: 5000,
  },
  {
    id: SPECIAL_ITEM_IDS.COMBO_MASTER,
    name: "Combo Master",
    description: "Fast clicks = bonus",
    baseCost: 150000,
    costGrowth: 2.5,
    effect: SPECIAL_ITEM_EFFECTS.COMBO_SYSTEM,
    multiplier: 1,
    category: SPECIAL_ITEM_CATEGORIES.SPECIAL,
    unlockRequirement: 7500,
  },
  {
    id: SPECIAL_ITEM_IDS.TIME_WARP,
    name: "Time Warp",
    description: "10s of production x2",
    baseCost: 300000,
    costGrowth: 2.5,
    effect: SPECIAL_ITEM_EFFECTS.TIME_BOOST,
    multiplier: 1,
    category: SPECIAL_ITEM_CATEGORIES.SPECIAL,
    unlockRequirement: 10000,
  },
  {
    id: SPECIAL_ITEM_IDS.FRENZY_MODE,
    name: "Frenzy Mode",
    description: "30s of clicks x5",
    baseCost: 600000,
    costGrowth: 2.5,
    effect: SPECIAL_ITEM_EFFECTS.CLICK_FRENZY,
    multiplier: 1,
    category: SPECIAL_ITEM_CATEGORIES.SPECIAL,
    unlockRequirement: 15000,
  },

  // Automation - Tier 1
  {
    id: SPECIAL_ITEM_IDS.AUTO_CLICKER,
    name: "Auto-Clicker",
    description: "1 automatic click per second",
    baseCost: 50000,
    costGrowth: 2.2,
    effect: SPECIAL_ITEM_EFFECTS.AUTO_CLICK,
    multiplier: 1,
    category: SPECIAL_ITEM_CATEGORIES.AUTOMATION,
    unlockRequirement: 4000,
  },
  {
    id: SPECIAL_ITEM_IDS.TURBO_AUTO_CLICKER,
    name: "Turbo Auto-Clicker",
    description: "5 automatic clicks per second",
    baseCost: 250000,
    costGrowth: 2.2,
    effect: SPECIAL_ITEM_EFFECTS.TURBO_AUTO,
    multiplier: 5,
    category: SPECIAL_ITEM_CATEGORIES.AUTOMATION,
    unlockRequirement: 8000,
  },
  {
    id: SPECIAL_ITEM_IDS.HYPER_AUTO_CLICKER,
    name: "Hyper Auto-Clicker",
    description: "10 automatic clicks per second",
    baseCost: 1000000,
    costGrowth: 2.2,
    effect: SPECIAL_ITEM_EFFECTS.HYPER_AUTO,
    multiplier: 10,
    category: SPECIAL_ITEM_CATEGORIES.AUTOMATION,
    unlockRequirement: 15000,
    maxPurchases: 5,
  },
  {
    id: SPECIAL_ITEM_IDS.QUANTUM_AUTO_CLICKER,
    name: "Quantum Auto-Clicker",
    description: "25 automatic clicks per second",
    baseCost: 5000000,
    costGrowth: 2.2,
    effect: SPECIAL_ITEM_EFFECTS.QUANTUM_AUTO,
    multiplier: 25,
    category: SPECIAL_ITEM_CATEGORIES.AUTOMATION,
    unlockRequirement: 30000,
    maxPurchases: 3,
  },

  // Fun/Meme Items (easier to get early)
  // {
  //   id: SPECIAL_ITEM_IDS.STACK_OVERFLOW,
  //   name: "Stack Overflow",
  //   description: "Instantly solve all bugs",
  //   baseCost: 2500,
  //   costGrowth: 2.0,
  //   effect: SPECIAL_ITEM_EFFECTS.DEBUG_MODE,
  //   multiplier: 1,
  //   category: SPECIAL_ITEM_CATEGORIES.SPECIAL,
  //   unlockRequirement: 1000,
  //   maxPurchases: 1,
  //   isFeatureUnlock: true,
  // },
  {
    id: SPECIAL_ITEM_IDS.DUCK_WALKER,
    name: "Duck Walker",
    description: "Animated ducks walk across the screen - click them for bonus power!",
    baseCost: 5000,
    costGrowth: 2.0,
    effect: SPECIAL_ITEM_EFFECTS.DUCK_WALKER,
    multiplier: 1,
    category: SPECIAL_ITEM_CATEGORIES.SPECIAL,
    unlockRequirement: 1500,
  },
  {
    id: SPECIAL_ITEM_IDS.CAFFEINE_IV,
    name: "Caffeine IV",
    description: "Caffeine drip to code 24/7",
    baseCost: 10000,
    costGrowth: 2.0,
    effect: SPECIAL_ITEM_EFFECTS.CAFFEINE_BOOST,
    multiplier: 1.2,
    category: SPECIAL_ITEM_CATEGORIES.GLOBAL,
    unlockRequirement: 2000,
  },
];

export const getSpecialItemCost = (item: SpecialItem, currentLevel: number = 0): number => {
  return Math.floor(item.baseCost * Math.pow(item.costGrowth, currentLevel));
};

export const isSpecialItemUnlocked = (item: SpecialItem, totalPower: number): boolean => {
  return totalPower >= (item.unlockRequirement || 0);
};

export const canPurchaseSpecialItem = (
  item: SpecialItem, 
  currentLevel: number, 
  currentPower: number,
  totalPower: number,
  upgradesState: Record<number, number> = {}
): boolean => {
  if (!isSpecialItemUnlocked(item, totalPower)) return false;
  if (item.maxPurchases && currentLevel >= item.maxPurchases) return false;
  
  // Check if required upgrades are owned for upgrade boost items
  if (item.category === SPECIAL_ITEM_CATEGORIES.UPGRADE_BOOST) {
    const requiredUpgradeIds = getRequiredUpgradeIds(item);
    if (requiredUpgradeIds.length > 0) {
      // For upgrade boost items, at least one of the required upgrades must be owned
      const hasAnyRequiredUpgrade = requiredUpgradeIds.some(upgradeId => {
        const upgradeLevel = upgradesState[upgradeId] || 0;
        return upgradeLevel > 0;
      });
      
      if (!hasAnyRequiredUpgrade) {
        return false;
      }
    }
  }
  
  const cost = getSpecialItemCost(item, currentLevel);
  return currentPower >= cost;
};

// Helper function to map special items to required upgrade IDs
export const getRequiredUpgradeIds = (item: SpecialItem): number[] => {
  switch (item.effect) {
    case SPECIAL_ITEM_EFFECTS.AI_INTERN_BOOST:
      return [UPGRADE_IDS.AI_INTERN]; // AI Intern upgrade ID
    case SPECIAL_ITEM_EFFECTS.JUNIOR_DEV_BOOST:
      return [UPGRADE_IDS.JUNIOR_DEV]; // Junior Dev upgrade ID  
    case SPECIAL_ITEM_EFFECTS.DEVOPS_BOOST:
      return [UPGRADE_IDS.JUNIOR_DEVOPS, UPGRADE_IDS.SENIOR_DEVOPS]; // Junior DevOps and Senior DevOps upgrade IDs
    case SPECIAL_ITEM_EFFECTS.CLOUD_BOOST:
      return [UPGRADE_IDS.CLOUD_REGION, UPGRADE_IDS.MULTI_CLOUD]; // Cloud Region and Multi-Cloud upgrade IDs
    case SPECIAL_ITEM_EFFECTS.AI_ML_BOOST:
      return [UPGRADE_IDS.AI_INTERN, UPGRADE_IDS.ML_MODEL, UPGRADE_IDS.NEURAL_NETWORK, UPGRADE_IDS.AIOPS, UPGRADE_IDS.AI_TESTING]; // AI Intern, ML Model, Neural Network, AIOps, AI Testing upgrade IDs
    default:
      return []; // No requirements for other items
  }
};

export const getSpecialItemsByCategory = (category: string) => {
  return SPECIAL_ITEMS.filter(item => item.category === category);
};

export const getAllSpecialItems = (): SpecialItem[] => {
  return SPECIAL_ITEMS;
};

// Helper function to get required upgrade names for display
export const getRequiredUpgradeNames = (item: SpecialItem): string[] => {
  const upgradeIds = getRequiredUpgradeIds(item);
  return upgradeIds.map(id => {
    const upgrade = getUpgradeById(id);
    return upgrade ? upgrade.name : `Upgrade ${id}`;
  });
};
