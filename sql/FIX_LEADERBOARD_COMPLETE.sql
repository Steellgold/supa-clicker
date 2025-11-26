DROP VIEW IF EXISTS leaderboard_view;

DROP FUNCTION IF EXISTS get_leaderboard(text, integer);

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
      ELSE jsonb_array_length(cs.achievements)
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

SELECT * FROM leaderboard_view LIMIT 5;
SELECT * FROM get_leaderboard() LIMIT 5;