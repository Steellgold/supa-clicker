import { z } from 'zod';

const RecordNumberNumberSchema = z.record(z.string(), z.number()).transform(
  (val) => {
    const result: Record<number, number> = {};
    for (const [key, value] of Object.entries(val)) {
      const numKey = parseInt(key, 10);
      if (!isNaN(numKey)) {
        result[numKey] = value;
      }
    }
    return result;
  }
);

export const GameStateSchema = z.object({
  totalClicks: z.number().min(0),
  totalPower: z.number().min(0),
  currentPower: z.number().min(0),
  clickPower: z.number().min(1),
  pps: z.number().min(0),
  upgrades: RecordNumberNumberSchema,
  specialItems: RecordNumberNumberSchema,
  unlockedAchievements: z.array(z.number().int().min(0)).max(1000),
  lastSaveTime: z.number().min(0),
  prestigeLevel: z.number().int().min(0).max(50),
  resourcesPerSecond: z.number().min(0),
  currentResources: z.number().min(0),
  comboCount: z.number().int().min(0).max(1000),
  comboActive: z.boolean(),
  lastClickTime: z.number().min(0),
  timeBoostActive: z.boolean(),
  timeBoostEndTime: z.number().min(0),
  timeBoostMultiplier: z.number().min(1).max(1000)
});

export const SaveGameRequestSchema = z.object({
  gameData: GameStateSchema
});

export const LoadGameResponseSchema = z.object({
  gameData: GameStateSchema.nullable()
});

export type GameStateValidated = z.infer<typeof GameStateSchema>;
export type SaveGameRequest = z.infer<typeof SaveGameRequestSchema>;
export type LoadGameResponse = z.infer<typeof LoadGameResponseSchema>;