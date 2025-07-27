import { z } from 'zod';

// Input validation schemas
export const clickEventSchema = z.object({
  timestamp: z.number().optional()
});

export const buyUpgradeEventSchema = z.object({
  upgradeId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  isBulk: z.boolean().optional()
}).refine((data) => {
  if (!data.isBulk && data.quantity > 100) {
    return false;
  }
  if (data.isBulk && data.quantity > 10000) {
    return false;
  }

  return true;
}, {
  message: "Quantity exceeds allowed limits"
});

export const resetEventSchema = z.boolean().optional();

export const prestigeEventSchema = z.boolean().optional();

export const prestigeStatsSchema = z.object({
  prestige_level: z.number().int().min(0),
  start_time: z.number(),
  end_time: z.number(),
  duration_seconds: z.number(),
  total_power_earned: z.number(),
  total_clicks: z.number(),
  upgrades_purchased: z.number(),
  power_spent_on_upgrades: z.number(),
  max_pps_reached: z.number(),
  max_ppc_reached: z.number(),
  final_upgrades: z.array(z.object({
    id: z.number().int().positive(),
    level: z.number().int().min(0)
  })),
  achievements_unlocked: z.array(z.number())
});

export const gameStateSchema = z.object({
  ppc: z.number().min(1).max(1000000),
  pps: z.number().min(0).max(10000000),
  power: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
  total_power: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
  upgrades: z.array(z.object({
    id: z.number().int().positive(),
    level: z.number().int().min(0).max(10000)
  })),
  prestige_level: z.number().int().min(0).max(50),
  lifetime_power: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
  lifetime_clicks: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
  unlocked_achievements: z.array(z.number()),
  prestige_stats: z.array(prestigeStatsSchema),
  current_prestige_start_time: z.number(),
  current_prestige_clicks: z.number().min(0),
  current_prestige_upgrades_purchased: z.number().min(0),
  current_prestige_power_spent: z.number().min(0),
  current_prestige_power_earned: z.number().min(0)
});

export const sessionSchema = z.object({
  userId: z.string().uuid(),
  lastClickTimestamps: z.array(z.number()),
  power: z.number().min(0),
  gameState: gameStateSchema,
  clickTimestamps: z.array(z.number())
});

export const RATE_LIMITS = {
  CLICKS_PER_SECOND: 20,
  PURCHASES_PER_MINUTE: 60,
  CONNECTIONS_PER_IP: 1
} as const;

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`);
  }
  return result.data;
}

export function sanitizeGameState(gameState: any): boolean {
  try {
    if (!gameState.lifetime_clicks) gameState.lifetime_clicks = 0;
    if (!gameState.unlocked_achievements) gameState.unlocked_achievements = [];
    if (!gameState.prestige_stats) gameState.prestige_stats = [];
    if (!gameState.current_prestige_start_time) gameState.current_prestige_start_time = Date.now();
    if (!gameState.current_prestige_clicks) gameState.current_prestige_clicks = 0;
    if (!gameState.current_prestige_upgrades_purchased) gameState.current_prestige_upgrades_purchased = 0;
    if (!gameState.current_prestige_power_spent) gameState.current_prestige_power_spent = 0;
    
    validateInput(gameStateSchema, gameState);
    
    if (gameState.power > gameState.total_power) {
      console.warn('[VALIDATION] Power exceeds total_power, correcting');
      gameState.power = gameState.total_power;
    }

    if (gameState.total_power > gameState.lifetime_power) {
      console.warn('[VALIDATION] total_power exceeds lifetime_power, correcting');
      gameState.lifetime_power = gameState.total_power;
    }
    
    for (const upgrade of gameState.upgrades) {
      if (upgrade.level > 10000) {
        console.warn(`[VALIDATION] Upgrade ${upgrade.id} level ${upgrade.level} seems suspicious`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('[VALIDATION] Game state validation failed:', error);
    console.warn('[VALIDATION] Attempting to fix game state data...');
    
    try {
      // Apply basic fixes
      if (!gameState.lifetime_clicks) gameState.lifetime_clicks = 0;
      if (!gameState.unlocked_achievements) gameState.unlocked_achievements = [];
      if (!gameState.prestige_stats) gameState.prestige_stats = [];
      if (!gameState.current_prestige_start_time) gameState.current_prestige_start_time = Date.now();
      if (!gameState.current_prestige_clicks) gameState.current_prestige_clicks = 0;
      if (!gameState.current_prestige_upgrades_purchased) gameState.current_prestige_upgrades_purchased = 0;
      if (!gameState.current_prestige_power_spent) gameState.current_prestige_power_spent = 0;
      
      validateInput(gameStateSchema, gameState);
      console.log('[VALIDATION] Game state fixed successfully');
      return true;
    } catch (fixError) {
      console.error('[VALIDATION] Failed to fix game state:', fixError);
      return false;
    }
  }
}