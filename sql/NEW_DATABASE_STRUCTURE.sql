-- ===============================
-- NOUVELLE STRUCTURE BASE DE DONNÉES SUPA-CLICKER
-- Version 2.0 - Architecture Sécurisée
-- ===============================

-- 1. TABLE UTILISATEURS (Profils)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    avatar_url TEXT,
    display_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    
    -- Statistiques publiques
    total_playtime_seconds BIGINT DEFAULT 0,
    achievements_count INTEGER DEFAULT 0,
    prestige_level INTEGER DEFAULT 0,
    
    -- Préférences
    settings JSONB DEFAULT '{"theme": "auto", "notifications": true}'::jsonb,
    
    -- Contraintes
    CONSTRAINT valid_username CHECK (username ~ '^[a-zA-Z0-9_-]{3,50}$'),
    CONSTRAINT valid_prestige CHECK (prestige_level >= 0 AND prestige_level <= 50)
);

-- 2. TABLE PROGRESSION PRINCIPALE (État du jeu)
CREATE TABLE game_progression (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Progression principale
    total_clicks BIGINT DEFAULT 0,
    total_power DECIMAL(20,2) DEFAULT 0,
    current_power DECIMAL(20,2) DEFAULT 0,
    power_per_second DECIMAL(15,2) DEFAULT 0,
    click_power DECIMAL(15,2) DEFAULT 1,
    
    -- Système prestige
    prestige_level INTEGER DEFAULT 0,
    prestige_points DECIMAL(15,2) DEFAULT 0,
    total_prestige_power DECIMAL(20,2) DEFAULT 0,
    
    -- Effets temporaires
    combo_count INTEGER DEFAULT 0,
    combo_active BOOLEAN DEFAULT FALSE,
    last_click_time TIMESTAMPTZ DEFAULT NOW(),
    
    -- Boosts temporaires
    active_boosts JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_save_time TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes de sécurité
    CONSTRAINT valid_progression CHECK (
        total_clicks >= 0 AND
        total_power >= 0 AND
        current_power >= 0 AND
        current_power <= total_power * 1.1 AND -- 10% tolérance
        power_per_second >= 0 AND
        click_power >= 1 AND
        prestige_level >= 0 AND prestige_level <= 50 AND
        combo_count >= 0 AND combo_count <= 1000
    ),
    
    -- Index pour performance
    UNIQUE(user_id)
);

-- 3. TABLE UPGRADES POSSÉDÉS
CREATE TABLE user_upgrades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    upgrade_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    
    -- Historique
    first_purchased_at TIMESTAMPTZ DEFAULT NOW(),
    last_purchased_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT valid_upgrade CHECK (
        upgrade_id > 0 AND upgrade_id <= 100 AND
        quantity >= 0 AND quantity <= 10000 AND
        total_spent >= 0
    ),
    
    -- Unique par utilisateur et upgrade
    UNIQUE(user_id, upgrade_id)
);

-- 4. TABLE SPECIAL ITEMS POSSÉDÉS
CREATE TABLE user_special_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    special_item_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    
    -- Effets calculés (pour optimisation)
    effect_multiplier DECIMAL(10,4) DEFAULT 1.0000,
    
    -- Historique
    first_purchased_at TIMESTAMPTZ DEFAULT NOW(),
    last_purchased_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT valid_special_item CHECK (
        special_item_id > 0 AND special_item_id <= 50 AND
        quantity >= 0 AND quantity <= 100 AND
        total_spent >= 0 AND
        effect_multiplier >= 1.0 AND effect_multiplier <= 1000.0
    ),
    
    -- Unique par utilisateur et special item
    UNIQUE(user_id, special_item_id)
);

-- 5. TABLE ACHIEVEMENTS
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Valeur au moment du déblocage (pour statistiques)
    unlock_value DECIMAL(20,2),
    
    -- Contraintes
    CONSTRAINT valid_achievement CHECK (
        achievement_id > 0 AND achievement_id <= 1000 AND
        unlock_value >= 0
    ),
    
    -- Unique par utilisateur et achievement
    UNIQUE(user_id, achievement_id)
);

-- 6. TABLE LEADERBOARDS
CREATE TABLE leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Scores
    total_power DECIMAL(20,2) DEFAULT 0,
    total_clicks BIGINT DEFAULT 0,
    prestige_level INTEGER DEFAULT 0,
    achievements_count INTEGER DEFAULT 0,
    
    -- Temps de jeu
    playtime_seconds BIGINT DEFAULT 0,
    
    -- Métadonnées
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    season VARCHAR(20) DEFAULT 'global', -- Pour futur système de saisons
    
    -- Contraintes
    CONSTRAINT valid_leaderboard CHECK (
        total_power >= 0 AND
        total_clicks >= 0 AND
        prestige_level >= 0 AND prestige_level <= 50 AND
        achievements_count >= 0 AND achievements_count <= 1000 AND
        playtime_seconds >= 0
    ),
    
    -- Un seul entry par utilisateur par saison
    UNIQUE(user_id, season)
);

-- 7. TABLE AUDIT DE SÉCURITÉ
CREATE TABLE security_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Type d'événement
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Détails
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    
    -- Contexte technique
    ip_address INET,
    user_agent TEXT,
    endpoint VARCHAR(100),
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_audit_user_time ON security_audit(user_id, created_at);
CREATE INDEX idx_security_audit_severity ON security_audit(severity, created_at);

-- 8. TABLE HISTORIQUE DES ACTIONS
CREATE TABLE action_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Type d'action
    action_type VARCHAR(20) NOT NULL CHECK (
        action_type IN ('click', 'purchase_upgrade', 'purchase_special', 'prestige', 'save')
    ),
    
    -- Détails de l'action
    target_id INTEGER, -- ID de l'upgrade/special item
    quantity INTEGER DEFAULT 1,
    cost DECIMAL(15,2),
    gained_power DECIMAL(15,2),
    
    -- État avant/après (sample)
    power_before DECIMAL(20,2),
    power_after DECIMAL(20,2),
    
    -- Métadonnées
    session_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT valid_action CHECK (
        quantity > 0 AND quantity <= 1000 AND
        cost >= 0 AND
        gained_power >= 0 AND
        power_before >= 0 AND
        power_after >= power_before
    )
);

-- 9. TABLE SESSIONS UTILISATEUR
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informations de session
    session_token VARCHAR(100) UNIQUE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    
    -- Statistiques de session
    clicks_count INTEGER DEFAULT 0,
    power_gained DECIMAL(15,2) DEFAULT 0,
    
    -- Métadonnées
    ip_address INET,
    user_agent TEXT,
    
    -- Contraintes
    CONSTRAINT valid_session CHECK (
        clicks_count >= 0 AND
        power_gained >= 0 AND
        (ended_at IS NULL OR ended_at >= started_at)
    )
);

-- ===============================
-- INDEX POUR PERFORMANCE
-- ===============================

-- Performance queries
CREATE INDEX idx_game_progression_user ON game_progression(user_id);
CREATE INDEX idx_user_upgrades_user ON user_upgrades(user_id);
CREATE INDEX idx_user_special_items_user ON user_special_items(user_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- Leaderboards
CREATE INDEX idx_leaderboard_total_power ON leaderboard_entries(total_power DESC);
CREATE INDEX idx_leaderboard_prestige ON leaderboard_entries(prestige_level DESC, total_power DESC);
CREATE INDEX idx_leaderboard_clicks ON leaderboard_entries(total_clicks DESC);

-- Audit et historique
CREATE INDEX idx_action_history_user_time ON action_history(user_id, created_at DESC);
CREATE INDEX idx_action_history_type ON action_history(action_type, created_at DESC);

-- Sessions
CREATE INDEX idx_user_sessions_active ON user_sessions(user_id, last_activity DESC) 
    WHERE ended_at IS NULL;

-- ===============================
-- FONCTIONS UTILITAIRES
-- ===============================

-- Fonction pour mettre à jour le leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard_entry(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO leaderboard_entries (
        user_id, total_power, total_clicks, prestige_level, 
        achievements_count, playtime_seconds
    )
    SELECT 
        p.user_id,
        p.total_power,
        p.total_clicks,
        p.prestige_level,
        COALESCE(ach.count, 0),
        COALESCE(prof.total_playtime_seconds, 0)
    FROM game_progression p
    LEFT JOIN user_profiles prof ON prof.id = p.user_id
    LEFT JOIN (
        SELECT user_id, COUNT(*) as count 
        FROM user_achievements 
        WHERE user_id = p_user_id 
        GROUP BY user_id
    ) ach ON ach.user_id = p.user_id
    WHERE p.user_id = p_user_id
    ON CONFLICT (user_id, season) 
    DO UPDATE SET
        total_power = EXCLUDED.total_power,
        total_clicks = EXCLUDED.total_clicks,
        prestige_level = EXCLUDED.prestige_level,
        achievements_count = EXCLUDED.achievements_count,
        playtime_seconds = EXCLUDED.playtime_seconds,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider la progression
CREATE OR REPLACE FUNCTION validate_progression_increase(
    p_user_id UUID,
    p_old_power DECIMAL,
    p_new_power DECIMAL,
    p_action_type VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    power_increase DECIMAL;
    max_reasonable_increase DECIMAL;
    user_click_power DECIMAL;
    user_pps DECIMAL;
BEGIN
    power_increase := p_new_power - p_old_power;
    
    -- Obtenir les stats actuelles
    SELECT click_power, power_per_second 
    INTO user_click_power, user_pps
    FROM game_progression 
    WHERE user_id = p_user_id;
    
    -- Calculer l'augmentation maximale raisonnable
    CASE p_action_type
        WHEN 'click' THEN
            max_reasonable_increase := user_click_power * 200; -- Permet les effets spéciaux
        WHEN 'pps_tick' THEN
            max_reasonable_increase := user_pps * 2; -- 2 secondes max
        WHEN 'purchase' THEN
            max_reasonable_increase := 0; -- Les achats diminuent le power
        ELSE
            max_reasonable_increase := user_click_power * 100;
    END CASE;
    
    -- Valider
    RETURN power_increase <= max_reasonable_increase;
END;
$$ LANGUAGE plpgsql;

-- ===============================
-- ROW LEVEL SECURITY (RLS)
-- ===============================

-- Activer RLS sur toutes les tables utilisateur
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_special_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_history ENABLE ROW LEVEL SECURITY;

-- Politiques RLS - Les utilisateurs ne peuvent voir que leurs propres données
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own progression" ON game_progression
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own upgrades" ON user_upgrades
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own special items" ON user_special_items
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own action history" ON action_history
    FOR ALL USING (auth.uid() = user_id);

-- Leaderboard accessible en lecture à tous
CREATE POLICY "Public leaderboard read" ON leaderboard_entries
    FOR SELECT USING (true);

-- Seuls les utilisateurs authentifiés peuvent modifier leur entry
CREATE POLICY "Users can update own leaderboard entry" ON leaderboard_entries
    FOR ALL USING (auth.uid() = user_id);

-- ===============================
-- TRIGGERS AUTOMATIQUES
-- ===============================

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_progression_updated_at 
    BEFORE UPDATE ON game_progression
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour audit automatique
CREATE OR REPLACE FUNCTION audit_progression_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Détecter les changements suspects
    IF NEW.total_power > OLD.total_power * 10 THEN
        INSERT INTO security_audit (
            user_id, event_type, severity, description,
            old_values, new_values
        ) VALUES (
            NEW.user_id, 'suspicious_progression', 'high',
            'Progression increase too large',
            to_jsonb(OLD), to_jsonb(NEW)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_game_progression_changes
    AFTER UPDATE ON game_progression
    FOR EACH ROW EXECUTE FUNCTION audit_progression_changes();

-- ===============================
-- VUES POUR PERFORMANCE
-- ===============================

-- Vue pour leaderboard optimisé
CREATE VIEW leaderboard_view AS
SELECT 
    le.user_id,
    up.username,
    up.display_name,
    up.avatar_url,
    le.total_power,
    le.total_clicks,
    le.prestige_level,
    le.achievements_count,
    le.last_updated,
    ROW_NUMBER() OVER (ORDER BY le.total_power DESC) as rank
FROM leaderboard_entries le
JOIN user_profiles up ON up.id = le.user_id
WHERE le.season = 'global'
ORDER BY le.total_power DESC;

-- Vue pour statistiques utilisateur
CREATE VIEW user_stats_view AS
SELECT 
    up.id,
    up.username,
    gp.total_power,
    gp.total_clicks,
    gp.prestige_level,
    COUNT(ua.id) as achievements_count,
    COUNT(uu.id) as upgrades_owned,
    COUNT(usi.id) as special_items_owned
FROM user_profiles up
LEFT JOIN game_progression gp ON gp.user_id = up.id
LEFT JOIN user_achievements ua ON ua.user_id = up.id
LEFT JOIN user_upgrades uu ON uu.user_id = up.id AND uu.quantity > 0
LEFT JOIN user_special_items usi ON usi.user_id = up.id AND usi.quantity > 0
GROUP BY up.id, gp.total_power, gp.total_clicks, gp.prestige_level;