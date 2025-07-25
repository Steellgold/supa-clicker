import { Upgrade } from '@/type/game';
import { createClient } from '@supabase/supabase-js';
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface GameStateDB {
  user_id: string;
  ppc: number;
  pps: number;
  power: number;
  total_power: number;
  upgrades: Upgrade[];
  created_at?: string;
  updated_at?: string;
}