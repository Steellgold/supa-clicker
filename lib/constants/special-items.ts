/**
 * Special Items IDs - Centralized constants for special item identification
 * This ensures type safety and easier maintenance when special items change
 */

export const SPECIAL_ITEM_IDS = {
  // Features & Unlocks
  STACK_OVERFLOW: 21,

  // Upgrade Boosts
  AI_TRAINING_PLUS: 2,
  DEV_CERTIFICATION: 3,
  KUBERNETES_MASTER: 4,
  CLOUD_CERTIFICATION: 5,
  ML_EXPERTISE: 6,

  // Global Multipliers
  SUPABASE_PRO: 7,
  ENTERPRISE_PLAN: 8,
  UNICORN_STATUS: 9,
  IPO: 10,
  TECH_MONOPOLY: 11,
  CAFFEINE_IV: 23,

  // Special Click Effects
  GOLDEN_CLICK: 12,
  LUCKY_STREAK: 13,
  COMBO_MASTER: 14,
  TIME_WARP: 15,
  FRENZY_MODE: 16,

  // Automation
  AUTO_CLICKER: 17,
  TURBO_AUTO_CLICKER: 18,
  HYPER_AUTO_CLICKER: 19,
  QUANTUM_AUTO_CLICKER: 20,

  // Fun/Meme Items
  DUCK_WALKER: 22,
} as const;

/**
 * Special Item Effects - Centralized effect strings
 * This ensures consistency across the application
 */
export const SPECIAL_ITEM_EFFECTS = {
  // Upgrade Boosts
  AI_INTERN_BOOST: "x2 AI Intern",
  JUNIOR_DEV_BOOST: "x3 Junior Dev",
  DEVOPS_BOOST: "x2 DevOps",
  CLOUD_BOOST: "x1.5 Cloud",
  AI_ML_BOOST: "x3 AI/ML",

  // Global Effects
  GLOBAL_1_5X: "x1.5 Global",
  GLOBAL_2X: "x2 Global",
  GLOBAL_3X: "x3 Global",
  GLOBAL_5X: "x5 Global",
  GLOBAL_10X: "x10 Global",

  // Special Effects
  GOLDEN_CLICK: "Golden Click",
  LUCKY_STREAK: "Lucky Streak",
  COMBO_SYSTEM: "Combo Master",
  TIME_BOOST: "Time Warp",
  CLICK_FRENZY: "Frenzy Mode",

  // Automation Effects
  AUTO_CLICK: "Auto-Clicker",
  TURBO_AUTO: "Turbo Auto-Clicker",
  HYPER_AUTO: "Hyper Auto-Clicker",
  QUANTUM_AUTO: "Quantum Auto-Clicker",

  // Feature Unlocks
  DEBUG_MODE: "Debug Mode",
  DUCK_WALKER: "Duck Walker",
  CAFFEINE_BOOST: "Caffeine Boost",
} as const;

export const SPECIAL_ITEM_CATEGORIES = {
  UPGRADE_BOOST: "upgrade_boost",
  GLOBAL: "global",
  SPECIAL: "special",
  AUTOMATION: "automation",
} as const;

export type SpecialItemId = typeof SPECIAL_ITEM_IDS[keyof typeof SPECIAL_ITEM_IDS];
export type SpecialItemEffect = typeof SPECIAL_ITEM_EFFECTS[keyof typeof SPECIAL_ITEM_EFFECTS];
export type SpecialItemCategory = typeof SPECIAL_ITEM_CATEGORIES[keyof typeof SPECIAL_ITEM_CATEGORIES];
