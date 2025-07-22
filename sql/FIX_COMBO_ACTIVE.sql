ALTER TABLE clicker_saves ADD COLUMN IF NOT EXISTS combo_active BOOLEAN DEFAULT false;

UPDATE clicker_saves 
SET special_items = special_items - 'comboActive'
WHERE special_items ? 'comboActive';

UPDATE clicker_saves 
SET upgrades = upgrades - 'rps' || jsonb_build_object('pps', upgrades->'rps')
WHERE upgrades ? 'rps';

SELECT 
  user_id,
  combo_active,
  special_items ? 'comboActive' as still_has_combo_active_in_special,
  upgrades ? 'rps' as has_rps,
  upgrades ? 'pps' as has_pps
FROM clicker_saves;