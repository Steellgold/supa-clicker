export const GAME_CONFIG = {
  INTERVALS: {
    /** How often to auto-save game progress */
    AUTO_SAVE: 2000, // Réduit à 2 secondes pour éviter les problèmes de synchronisation lors des achats
    
    /** How often to update PPS (power per second) */
    PPS_UPDATE: 1000,
    
    /** Max time between clicks to maintain combo */
    COMBO_TIMEOUT: 500,
    
    /** Duration of click visual effects */
    CLICK_EFFECT_DURATION: 1000,
    CLICKING_STATE_DURATION: 100,
    ACTIVE_STATE_DURATION: 300,
    
    /** How long achievement notifications stay visible */
    ACHIEVEMENT_NOTIFICATION: 5000,
    
    /** Duck walker spawn interval */
    DUCK_SPAWN: 1000,
    
    /** Animation frame rate (~60fps) */
    ANIMATION_FRAME: 16,
  },

  // ===============================
  // API & SECURITY
  // ===============================
  SECURITY: {
    /** CSRF token expiration time */
    CSRF_TOKEN_EXPIRY: 3600000, // 1 hour
    
    /** Minimum time between save requests per user */
    SAVE_RATE_LIMIT: 20000, // 20 seconds
    
    /** Max time gap to validate offline progress */
    MAX_OFFLINE_PROGRESS: 30 * 60 * 1000, // 30 minutes
    
    /** Maximum size for game data JSON */
    MAX_DATA_SIZE: 1024 * 1024, // 1MB
    
    /** Anti-cheat validation settings */
    ANTI_CHEAT: {
      /** Multiplier tolerance for progression validation */
      TOLERANCE_MULTIPLIER: 10,
      
      /** Max clicks to account for in tolerance calculation */
      MAX_CLICKS_TOLERANCE: 100,
      
      /** Minimum power gain to trigger suspicious activity check */
      MIN_SUSPICIOUS_GAIN: 1000,
      
      /** Max PPS multiplier increase allowed in short time */
      PPS_INCREASE_THRESHOLD: 5,
      
      /** Time window for PPS increase detection (ms) */
      PPS_INCREASE_TIME_WINDOW: 10000, // 10 seconds
      
      /** Max click power multiplier increase allowed in short time */
      CLICK_POWER_THRESHOLD: 10,
      
      /** Time window for click power increase detection (ms) */
      CLICK_POWER_TIME_WINDOW: 5000, // 5 seconds
    },

    /** Allowed origins for API requests */
    ALLOWED_ORIGINS: [
      "https://supaclicker.vercel.app",
      "https://preview-supaclicker.vercel.app",
      "http://localhost:3000",
      "https://localhost:3000"
    ],
  },

  // ===============================
  // SPECIAL ABILITIES & MECHANICS
  // ===============================
  SPECIAL_ABILITIES: {
    /** Chance for Golden Click (x100 multiplier) */
    GOLDEN_CLICK_CHANCE: 0.01, // 1%
    
    /** Golden Click multiplier value */
    GOLDEN_CLICK_MULTIPLIER: 100,
    
    /** Chance for Lucky Streak (x50 multiplier) */
    LUCKY_STREAK_CHANCE: 0.02, // 2%
    
    /** Lucky Streak multiplier value */
    LUCKY_STREAK_MULTIPLIER: 50,
    
    /** Combo system settings */
    COMBO: {
      /** Multiplier increase per combo level */
      MULTIPLIER_INCREMENT: 0.1,
      
      /** Maximum combo multiplier cap */
      MAX_MULTIPLIER: 10,
    },
    
    /** Time Boost ability settings */
    TIME_BOOST: {
      /** Base chance to activate time boost */
      BASE_CHANCE: 0.05, // 5%
      
      /** Additional chance per level */
      CHANCE_PER_LEVEL: 0.01, // 1%
      
      /** Base duration of time boost */
      BASE_DURATION: 10000, // 10 seconds
      
      /** Additional duration per level */
      DURATION_PER_LEVEL: 2000, // 2 seconds
      
      /** Base multiplier strength */
      BASE_MULTIPLIER: 2, // 2x
      
      /** Additional multiplier per level */
      MULTIPLIER_PER_LEVEL: 0.5, // 0.5x
    },
    
    /** Auto-clicker rates (clicks per second) */
    AUTO_CLICKER: {
      BASIC: 1,
      TURBO: 5,
      HYPER: 10,
      QUANTUM: 25,
    },
  },

  // ===============================
  // VALIDATION LIMITS
  // ===============================
  LIMITS: {
    /** Maximum click power allowed */
    CLICK_POWER: 1000000,
    
    /** Maximum power per second allowed */
    PPS: 1000000,
    
    /** Maximum number of achievements */
    MAX_ACHIEVEMENTS: 1000,
    
    /** Maximum prestige level */
    MAX_PRESTIGE: 1000,
    
    /** Maximum combo count */
    MAX_COMBO: 1000,
    
    /** Maximum time boost multiplier */
    MAX_TIME_BOOST_MULTIPLIER: 1000,
    
    /** Maximum bulk buy quantity */
    BULK_BUY_MAX: 1000,
    
    /** Power validation settings */
    POWER_VALIDATION: {
      /** Multiplier for max allowed power gain */
      MAX_MULTIPLIER: 10,
      
      /** Minimum power threshold for validation */
      MIN_THRESHOLD: 100,
    },
  },

  // ===============================
  // DUCK WALKER SYSTEM
  // ===============================
  DUCK_WALKER: {
    /** Reward multiplier for higher levels */
    LEVEL_MULTIPLIERS: {
      LEVEL_3_PLUS: 1.5,
      LEVEL_5_PLUS: 2,
    },
    
    /** Speed randomization factor */
    SPEED_RANDOMIZATION: 0.2,
  },

  // ===============================
  // STORAGE & DATABASE
  // ===============================
  STORAGE: {
    /** Local storage key for game save data */
    GAME_SAVE_KEY: "clicker_game_save",
    
    /** Prefix for achievement storage keys */
    ACHIEVEMENTS_KEY_PREFIX: "achievements_viewed_",
    
    /** Database table name for saves */
    DB_TABLE: "clicker_saves",
  },

  // ===============================
  // EXTERNAL ASSETS
  // ===============================
  ASSETS: {
    /** Clicker button image URL */
    CLICKER_IMAGE: "https://s7yh4pytyr.ufs.sh/f/UAfcSNyPsVRcBNW5dZLiLn2WUYjB5ursFGVI4PJSbHf0K8p7",
    
    /** Power/resource icon image URL */
    POWER_IMAGE: "https://s7yh4pytyr.ufs.sh/f/UAfcSNyPsVRcaZbCWfRtnFV2sdUP3CpEvxLX6hT07JoGkQRK",
  },

  // ===============================
  // PRESTIGE SYSTEM
  // ===============================
  PRESTIGE: {
    /** Minimum power required to prestige */
    MINIMUM_POWER: 100000000, // 100M
    
    /** Base bonus multiplier per prestige level */
    BASE_BONUS: 1.1,
    
    /** Additional bonus per prestige level */
    BONUS_PER_LEVEL: 0.05, // 5% per level
  },

  // ===============================
  // ACHIEVEMENT THRESHOLDS
  // ===============================
  ACHIEVEMENTS: {
    /** Click count milestones */
    CLICK_THRESHOLDS: [1, 100, 500, 1000, 10000, 50000, 100000, 500000, 1000000],
    
    /** Resource/power milestones */
    RESOURCE_THRESHOLDS: [1000, 1000000, 1000000000, 1000000000000],
    
    /** PPS (power per second) milestones */
    PPS_THRESHOLDS: [10, 100, 1000, 10000, 100000],
  },

  // ===============================
  // API ENDPOINTS
  // ===============================
  ENDPOINTS: {
    /** CSRF token endpoint (deprecated - use crypto signatures) */
    // CSRF: "/api/csrf", // Deprecated - using crypto signatures instead

    /** Game save endpoint */
    GAME_SAVE: "/api/game/save",
    
    /** Game load endpoint */
    GAME_LOAD: "/api/game/load",
    
    /** Game reset endpoint */
    GAME_RESET: "/api/game/reset",
    
    /** Leaderboard endpoint */
    LEADERBOARD: "/api/leaderboard",
  },
} as const;

// Type exports for better TypeScript support
export type GameConfig = typeof GAME_CONFIG;
export type SecurityConfig = typeof GAME_CONFIG.SECURITY;
export type SpecialAbilitiesConfig = typeof GAME_CONFIG.SPECIAL_ABILITIES;
export type LimitsConfig = typeof GAME_CONFIG.LIMITS;