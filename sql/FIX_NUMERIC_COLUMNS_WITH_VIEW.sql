SELECT definition FROM pg_views WHERE viewname = 'leaderboard_view';

DROP VIEW IF EXISTS leaderboard_view;

ALTER TABLE clicker_saves 
  ALTER COLUMN current_power TYPE NUMERIC USING current_power::NUMERIC,
  ALTER COLUMN total_power TYPE NUMERIC USING total_power::NUMERIC,
  ALTER COLUMN total_clicks TYPE NUMERIC USING total_clicks::NUMERIC,
  ALTER COLUMN last_save_time TYPE NUMERIC USING last_save_time::NUMERIC;

CREATE VIEW leaderboard_view AS
SELECT 
  user_id,
  current_power,
  total_power,
  total_clicks,
  prestige_level,
  updated_at
FROM clicker_saves
ORDER BY total_power DESC;

SELECT 
  column_name, 
  data_type, 
  numeric_precision, 
  numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'clicker_saves' 
  AND column_name IN ('current_power', 'total_power', 'total_clicks', 'last_save_time', 'clicks_per_second')
ORDER BY column_name;