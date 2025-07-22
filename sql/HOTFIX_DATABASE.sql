-- ===============================
-- HOTFIX POUR RÉSOUDRE LES PROBLÈMES DB
-- Exécuter ce script pour corriger rapidement
-- ===============================

-- 1. D'abord, supprimer les tables si elles existent avec des erreurs
DROP TABLE IF EXISTS security_audit CASCADE;
DROP TABLE IF EXISTS action_history CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS leaderboard_entries CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS user_special_items CASCADE;
DROP TABLE IF EXISTS user_upgrades CASCADE;
DROP TABLE IF EXISTS game_progression CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Supprimer les fonctions qui posent problème
DROP FUNCTION IF EXISTS update_leaderboard_entry(UUID);
DROP FUNCTION IF EXISTS validate_progression_increase(UUID, DECIMAL, DECIMAL, VARCHAR);
DROP FUNCTION IF EXISTS audit_progression_changes();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 2. Recréer la structure simplifiée et fonctionnelle

-- Table des profils utilisateur (optionnelle, juste pour les métadonnées)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50),
    display_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table progression principale
CREATE TABLE game_progression (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Progression
    total_clicks BIGINT DEFAULT 0,
    total_power DECIMAL(20,2) DEFAULT 0,
    current_power DECIMAL(20,2) DEFAULT 0,
    power_per_second DECIMAL(15,2) DEFAULT 0,
    click_power DECIMAL(15,2) DEFAULT 1,
    prestige_level INTEGER DEFAULT 0,
    combo_count INTEGER DEFAULT 0,
    combo_active BOOLEAN DEFAULT FALSE,
    last_click_time TIMESTAMPTZ DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_save_time TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes de base
    CONSTRAINT valid_progression CHECK (
        total_clicks >= 0 AND
        total_power >= 0 AND
        current_power >= 0 AND
        power_per_second >= 0 AND
        click_power >= 1 AND
        prestige_level >= 0 AND prestige_level <= 50
    ),
    
    UNIQUE(user_id)
);

-- Table upgrades
CREATE TABLE user_upgrades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    upgrade_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    first_purchased_at TIMESTAMPTZ DEFAULT NOW(),
    last_purchased_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_upgrade CHECK (
        upgrade_id > 0 AND quantity >= 0 AND total_spent >= 0
    ),
    
    UNIQUE(user_id, upgrade_id)
);

-- Table special items
CREATE TABLE user_special_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    special_item_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    first_purchased_at TIMESTAMPTZ DEFAULT NOW(),
    last_purchased_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_special_item CHECK (
        special_item_id > 0 AND quantity >= 0 AND total_spent >= 0
    ),
    
    UNIQUE(user_id, special_item_id)
);

-- Table achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_achievement CHECK (achievement_id > 0),
    
    UNIQUE(user_id, achievement_id)
);

-- Table leaderboard simplifiée
CREATE TABLE leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_power DECIMAL(20,2) DEFAULT 0,
    total_clicks BIGINT DEFAULT 0,
    prestige_level INTEGER DEFAULT 0,
    achievements_count INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    season VARCHAR(20) DEFAULT 'global',
    
    CONSTRAINT valid_leaderboard CHECK (
        total_power >= 0 AND total_clicks >= 0 AND prestige_level >= 0
    ),
    
    UNIQUE(user_id, season)
);

-- 3. Index essentiels
CREATE INDEX idx_game_progression_user ON game_progression(user_id);
CREATE INDEX idx_user_upgrades_user ON user_upgrades(user_id);
CREATE INDEX idx_user_special_items_user ON user_special_items(user_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_leaderboard_total_power ON leaderboard_entries(total_power DESC);

-- 4. RLS simplifié
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_special_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Politiques RLS simples
CREATE POLICY "Users can manage own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own progression" ON game_progression
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own upgrades" ON user_upgrades
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own special items" ON user_special_items
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own achievements" ON user_achievements
    FOR ALL USING (auth.uid() = user_id);

-- Leaderboard: lecture publique, écriture privée
CREATE POLICY "Public leaderboard read" ON leaderboard_entries
    FOR SELECT USING (true);

CREATE POLICY "Users can update own leaderboard" ON leaderboard_entries
    FOR INSERT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entry" ON leaderboard_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Vue pour leaderboard
CREATE VIEW leaderboard_view AS
SELECT 
    le.user_id,
    COALESCE(up.username, 'Anonymous') as username,
    COALESCE(up.display_name, 'Player') as display_name,
    le.total_power,
    le.total_clicks,
    le.prestige_level,
    le.achievements_count,
    le.last_updated,
    ROW_NUMBER() OVER (ORDER BY le.total_power DESC) as rank
FROM leaderboard_entries le
LEFT JOIN user_profiles up ON up.id = le.user_id
WHERE le.season = 'global'
ORDER BY le.total_power DESC;

-- 6. Fonction trigger simple pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger uniquement où nécessaire
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_progression_updated_at 
    BEFORE UPDATE ON game_progression
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'HOTFIX TERMINÉ - Base de données prête à utiliser !';
    RAISE NOTICE 'Tables créées: user_profiles, game_progression, user_upgrades, user_special_items, user_achievements, leaderboard_entries';
    RAISE NOTICE 'RLS activé et politiques configurées';
    RAISE NOTICE 'Vous pouvez maintenant utiliser le jeu !';
END $$;