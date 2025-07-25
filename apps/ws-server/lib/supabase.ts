import type { Database, Upgrade } from "@clicker/game/types";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_SECRET_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export type GameStateDB = {
  user_id: string;
  ppc: number;
  pps: number;
  power: number;
  total_power: number;
  upgrades: Upgrade[];
  created_at?: string;
  updated_at?: string;
}