DROP VIEW IF EXISTS leaderboard_view;
DROP FUNCTION IF EXISTS get_leaderboard(text, integer);

ALTER TABLE clicker_saves 
  ALTER COLUMN current_power TYPE NUMERIC USING current_power::NUMERIC,
  ALTER COLUMN total_power TYPE NUMERIC USING total_power::NUMERIC,
  ALTER COLUMN total_clicks TYPE NUMERIC USING total_clicks::NUMERIC,
  ALTER COLUMN last_save_time TYPE NUMERIC USING last_save_time::NUMERIC;

ALTER TABLE clicker_saves ADD COLUMN IF NOT EXISTS combo_active BOOLEAN DEFAULT false;

ALTER TABLE clicker_saves ADD COLUMN IF NOT EXISTS click_power NUMERIC DEFAULT 1;
ALTER TABLE clicker_saves ADD COLUMN IF NOT EXISTS combo_count INTEGER DEFAULT 0;
ALTER TABLE clicker_saves ADD COLUMN IF NOT EXISTS last_click_time NUMERIC DEFAULT 0;

ALTER TABLE clicker_saves ADD COLUMN IF NOT EXISTS time_boost_active BOOLEAN DEFAULT false;
ALTER TABLE clicker_saves ADD COLUMN IF NOT EXISTS time_boost_end_time NUMERIC DEFAULT 0;
ALTER TABLE clicker_saves ADD COLUMN IF NOT EXISTS time_boost_multiplier NUMERIC DEFAULT 1;

ALTER TABLE clicker_saves ADD COLUMN IF NOT EXISTS purchased_upgrades JSONB DEFAULT '[]'::jsonb;
ALTER TABLE clicker_saves ADD COLUMN IF NOT EXISTS purchased_special_items JSONB DEFAULT '[]'::jsonb;

ALTER TABLE clicker_saves ADD COLUMN IF NOT EXISTS next_upgrade_costs JSONB DEFAULT '{}'::jsonb;
ALTER TABLE clicker_saves ADD COLUMN IF NOT EXISTS next_special_item_costs JSONB DEFAULT '{}'::jsonb;

UPDATE clicker_saves 
SET special_items = special_items - 'comboActive'
WHERE special_items ? 'comboActive';

UPDATE clicker_saves 
SET upgrades = upgrades - 'rps' || jsonb_build_object('pps', upgrades->'rps')
WHERE upgrades ? 'rps';

INSERT INTO public.clicker_saves (
    user_id,
    current_power,
    total_power,
    total_clicks,
    clicks_per_second,
    prestige_level,
    upgrades,
    special_items,
    achievements,
    last_save_time,
    combo_active,
    click_power,
    combo_count,
    last_click_time,
    time_boost_active,
    time_boost_end_time,
    time_boost_multiplier,
    purchased_upgrades,
    purchased_special_items,
    next_upgrade_costs,
    next_special_item_costs,
    created_at,
    updated_at
)
SELECT 
    p.user_id,
    0, -- current_power
    0, -- total_power
    0, -- total_clicks
    0, -- clicks_per_second
    0, -- prestige_level
    '{}'::jsonb, -- upgrades
    '{}'::jsonb, -- special_items
    '[]'::jsonb, -- achievements (array format)
    extract(epoch from NOW()) * 1000, -- last_save_time
    false, -- combo_active
    1, -- click_power
    0, -- combo_count
    0, -- last_click_time
    false, -- time_boost_active
    0, -- time_boost_end_time
    1, -- time_boost_multiplier
    '[]'::jsonb, -- purchased_upgrades
    '[]'::jsonb, -- purchased_special_items
    '{}'::jsonb, -- next_upgrade_costs
    '{}'::jsonb, -- next_special_item_costs
    NOW(),
    NOW()
FROM public.user_profiles p
LEFT JOIN public.clicker_saves cs ON p.user_id = cs.user_id
WHERE cs.user_id IS NULL;

DO $$
DECLARE
    user_record RECORD;
    random_key TEXT;
BEGIN
    FOR user_record IN 
        SELECT p.user_id 
        FROM public.user_profiles p
        LEFT JOIN public.user_crypto_keys uck ON p.user_id = uck.user_id
        WHERE uck.user_id IS NULL
    LOOP
        random_key := 'key_' || encode(gen_random_bytes(32), 'hex');
        
        INSERT INTO public.user_crypto_keys (
            user_id,
            public_key,
            created_at,
            expires_at
        ) VALUES (
            user_record.user_id,
            random_key,
            NOW(),
            NOW() + INTERVAL '30 days'
        );
    END LOOP;
END $$;


CREATE VIEW leaderboard_view AS
SELECT 
  cs.user_id,
  cs.current_power,
  cs.total_power,
  cs.total_clicks,
  cs.prestige_level,
  cs.updated_at
FROM clicker_saves cs
ORDER BY cs.total_power DESC NULLS LAST;

CREATE OR REPLACE FUNCTION get_leaderboard(
  order_by text DEFAULT 'total_power',
  limit_count integer DEFAULT 50
)
RETURNS TABLE (
  user_id text,
  username text,
  display_name text,
  current_power numeric,
  total_power numeric,
  total_clicks numeric,
  clicks_per_second numeric,
  prestige_level integer,
  achievements_count integer,
  updated_at timestamptz
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.user_id::text,
    COALESCE(up.username, 'Anonymous')::text,
    up.display_name::text,
    cs.current_power,
    cs.total_power,
    cs.total_clicks,
    cs.clicks_per_second,
    cs.prestige_level,
    CASE 
      WHEN cs.achievements IS NULL THEN 0
      WHEN jsonb_typeof(cs.achievements) = 'array' THEN jsonb_array_length(cs.achievements)
      ELSE 0
    END as achievements_count,
    cs.updated_at
  FROM clicker_saves cs
  LEFT JOIN user_profiles up ON cs.user_id = up.user_id
  ORDER BY 
    CASE 
      WHEN order_by = 'total_power' THEN cs.total_power
      WHEN order_by = 'current_power' THEN cs.current_power
      WHEN order_by = 'total_clicks' THEN cs.total_clicks
      ELSE cs.total_power
    END DESC NULLS LAST
  LIMIT limit_count;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_clicker_saves_combo_active ON public.clicker_saves(combo_active);
CREATE INDEX IF NOT EXISTS idx_clicker_saves_time_boost_active ON public.clicker_saves(time_boost_active);
CREATE INDEX IF NOT EXISTS idx_clicker_saves_prestige_level ON public.clicker_saves(prestige_level);

DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    col_name TEXT;
    expected_columns TEXT[] := ARRAY[
        'current_power', 'total_power', 'total_clicks', 'clicks_per_second',
        'prestige_level', 'upgrades', 'special_items', 'achievements',
        'last_save_time', 'combo_active', 'click_power', 'combo_count',
        'last_click_time', 'time_boost_active', 'time_boost_end_time',
        'time_boost_multiplier', 'purchased_upgrades', 'purchased_special_items',
        'next_upgrade_costs', 'next_special_item_costs'
    ];
BEGIN
    FOREACH col_name IN ARRAY expected_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'clicker_saves' AND column_name = col_name
        ) THEN
            missing_columns := array_append(missing_columns, col_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE WARNING 'Missing columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'All required columns are present ✓';
    END IF;
END $$;

DO $$
DECLARE
    user_count INTEGER;
    save_count INTEGER;
    key_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.user_profiles;
    SELECT COUNT(*) INTO save_count FROM public.clicker_saves;
    SELECT COUNT(*) INTO key_count FROM public.user_crypto_keys;
    
    RAISE NOTICE 'Migration completed:';
    RAISE NOTICE '- Users: %', user_count;
    RAISE NOTICE '- Saves: %', save_count;
    RAISE NOTICE '- Crypto keys: %', key_count;
    
    IF user_count = save_count AND user_count = key_count THEN
        RAISE NOTICE 'All users have saves and crypto keys! ✓';
    ELSE
        RAISE WARNING 'Mismatch detected - some users may still be missing data';
    END IF;
END $$;

SELECT * FROM get_leaderboard() LIMIT 3;

DO $$
BEGIN
    RAISE NOTICE 'Production migration completed successfully! ✅';
    RAISE NOTICE 'Database is ready for deployment.';
END $$;