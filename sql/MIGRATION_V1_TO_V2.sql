-- ===============================
-- MIGRATION SCRIPT - V1 TO V2
-- Supa-Clicker Database Migration
-- ===============================

-- ATTENTION: Exécuter ce script avec précaution en production
-- Il est recommandé de faire une sauvegarde complète avant migration

BEGIN;

-- ===============================
-- ÉTAPE 1: SAUVEGARDE DES DONNÉES
-- ===============================

-- Créer une table de sauvegarde temporaire
CREATE TABLE IF NOT EXISTS migration_backup_clicker_saves AS 
SELECT * FROM clicker_saves;

-- ===============================
-- ÉTAPE 2: CRÉER NOUVELLES TABLES
-- ===============================

-- Exécuter le script de création de la nouvelle structure
-- (Le contenu du fichier NEW_DATABASE_STRUCTURE.sql doit être exécuté ici)

-- ===============================
-- ÉTAPE 3: MIGRATION DES PROFILS UTILISATEUR
-- ===============================

-- Migrer ou créer les profils utilisateur
INSERT INTO user_profiles (
    id, 
    username, 
    display_name,
    created_at,
    updated_at,
    last_active,
    prestige_level
)
SELECT DISTINCT
    cs.user_id,
    -- Extraire le username depuis les métadonnées utilisateur si disponible
    COALESCE(
        (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = cs.user_id),
        'user_' || substring(cs.user_id::text, 1, 8)
    ) as username,
    COALESCE(
        (SELECT raw_user_meta_data->>'display_name' FROM auth.users WHERE id = cs.user_id),
        'Player ' || substring(cs.user_id::text, 1, 8)
    ) as display_name,
    COALESCE(cs.created_at, NOW()),
    COALESCE(cs.updated_at, NOW()),
    COALESCE(cs.updated_at, NOW()),
    COALESCE(cs.prestige_level, 0)
FROM migration_backup_clicker_saves cs
WHERE cs.user_id IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
    prestige_level = EXCLUDED.prestige_level,
    updated_at = NOW();

-- ===============================
-- ÉTAPE 4: MIGRATION PROGRESSION PRINCIPALE
-- ===============================

INSERT INTO game_progression (
    user_id,
    total_clicks,
    total_power,
    current_power,
    power_per_second,
    click_power,
    prestige_level,
    combo_count,
    combo_active,
    last_click_time,
    created_at,
    updated_at,
    last_save_time
)
SELECT 
    cs.user_id,
    COALESCE(cs.total_clicks, 0),
    COALESCE(cs.total_power, 0),
    COALESCE(cs.current_power, 0),
    COALESCE(cs.clicks_per_second, 0),
    -- Recalculer le click_power à partir des upgrades (approximation)
    GREATEST(1, COALESCE(cs.clicks_per_second * 0.1, 1)),
    COALESCE(cs.prestige_level, 0),
    0, -- combo_count reset
    COALESCE(cs.combo_active, false),
    COALESCE(cs.updated_at, NOW()),
    COALESCE(cs.created_at, NOW()),
    COALESCE(cs.updated_at, NOW()),
    COALESCE(cs.updated_at, NOW())
FROM migration_backup_clicker_saves cs
WHERE cs.user_id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
    total_clicks = EXCLUDED.total_clicks,
    total_power = EXCLUDED.total_power,
    current_power = EXCLUDED.current_power,
    power_per_second = EXCLUDED.power_per_second,
    prestige_level = EXCLUDED.prestige_level,
    updated_at = NOW();

-- ===============================
-- ÉTAPE 5: MIGRATION DES UPGRADES
-- ===============================

-- Fonction pour extraire et migrer les upgrades depuis le JSON
DO $$
DECLARE
    user_record RECORD;
    upgrade_key TEXT;
    upgrade_value INTEGER;
BEGIN
    -- Pour chaque utilisateur
    FOR user_record IN 
        SELECT user_id, upgrades 
        FROM migration_backup_clicker_saves 
        WHERE upgrades IS NOT NULL
    LOOP
        -- Pour chaque upgrade dans le JSON
        FOR upgrade_key, upgrade_value IN 
            SELECT * FROM jsonb_each_text(user_record.upgrades)
        LOOP
            -- Insérer l'upgrade si la quantité > 0
            IF upgrade_value::INTEGER > 0 THEN
                INSERT INTO user_upgrades (
                    user_id,
                    upgrade_id,
                    quantity,
                    total_spent,
                    first_purchased_at,
                    last_purchased_at
                ) VALUES (
                    user_record.user_id,
                    upgrade_key::INTEGER,
                    upgrade_value::INTEGER,
                    0, -- total_spent sera recalculé
                    NOW(),
                    NOW()
                ) ON CONFLICT (user_id, upgrade_id) DO UPDATE SET
                    quantity = EXCLUDED.quantity,
                    last_purchased_at = NOW();
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- ===============================
-- ÉTAPE 6: MIGRATION DES SPECIAL ITEMS
-- ===============================

-- Fonction pour extraire et migrer les special items depuis le JSON
DO $$
DECLARE
    user_record RECORD;
    special_key TEXT;
    special_value INTEGER;
BEGIN
    -- Pour chaque utilisateur
    FOR user_record IN 
        SELECT user_id, special_items 
        FROM migration_backup_clicker_saves 
        WHERE special_items IS NOT NULL
    LOOP
        -- Pour chaque special item dans le JSON
        FOR special_key, special_value IN 
            SELECT * FROM jsonb_each_text(user_record.special_items)
        LOOP
            -- Insérer le special item si la quantité > 0
            IF special_value::INTEGER > 0 THEN
                INSERT INTO user_special_items (
                    user_id,
                    special_item_id,
                    quantity,
                    total_spent,
                    effect_multiplier,
                    first_purchased_at,
                    last_purchased_at
                ) VALUES (
                    user_record.user_id,
                    special_key::INTEGER,
                    special_value::INTEGER,
                    0, -- total_spent sera recalculé
                    1.0, -- effect_multiplier par défaut
                    NOW(),
                    NOW()
                ) ON CONFLICT (user_id, special_item_id) DO UPDATE SET
                    quantity = EXCLUDED.quantity,
                    last_purchased_at = NOW();
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- ===============================
-- ÉTAPE 7: MIGRATION DES ACHIEVEMENTS
-- ===============================

-- Fonction pour extraire et migrer les achievements depuis le JSON
DO $$
DECLARE
    user_record RECORD;
    achievement_id INTEGER;
BEGIN
    -- Pour chaque utilisateur
    FOR user_record IN 
        SELECT user_id, achievements 
        FROM migration_backup_clicker_saves 
        WHERE achievements IS NOT NULL
    LOOP
        -- Pour chaque achievement dans le tableau JSON
        FOR achievement_id IN 
            SELECT jsonb_array_elements_text(user_record.achievements)::INTEGER
        LOOP
            INSERT INTO user_achievements (
                user_id,
                achievement_id,
                unlocked_at,
                unlock_value
            ) VALUES (
                user_record.user_id,
                achievement_id,
                NOW(),
                0 -- unlock_value par défaut
            ) ON CONFLICT (user_id, achievement_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- ===============================
-- ÉTAPE 8: INITIALISER LES LEADERBOARDS
-- ===============================

-- Créer les entrées de leaderboard pour tous les utilisateurs
INSERT INTO leaderboard_entries (
    user_id,
    total_power,
    total_clicks,
    prestige_level,
    achievements_count,
    playtime_seconds,
    last_updated,
    season
)
SELECT 
    gp.user_id,
    gp.total_power,
    gp.total_clicks,
    gp.prestige_level,
    COALESCE(ach_count.count, 0),
    0, -- playtime_seconds sera calculé plus tard
    NOW(),
    'global'
FROM game_progression gp
LEFT JOIN (
    SELECT user_id, COUNT(*) as count
    FROM user_achievements
    GROUP BY user_id
) ach_count ON ach_count.user_id = gp.user_id
ON CONFLICT (user_id, season) DO UPDATE SET
    total_power = EXCLUDED.total_power,
    total_clicks = EXCLUDED.total_clicks,
    prestige_level = EXCLUDED.prestige_level,
    achievements_count = EXCLUDED.achievements_count,
    last_updated = NOW();

-- ===============================
-- ÉTAPE 9: RECALCUL DES COÛTS ET EFFETS
-- ===============================

-- Fonction pour recalculer approximativement les coûts dépensés
-- (Basé sur les formules de progression connues)
CREATE OR REPLACE FUNCTION calculate_upgrade_total_cost(
    base_cost DECIMAL,
    growth_rate DECIMAL,
    quantity INTEGER
) RETURNS DECIMAL AS $$
DECLARE
    total_cost DECIMAL := 0;
    i INTEGER;
BEGIN
    FOR i IN 0..(quantity-1) LOOP
        total_cost := total_cost + (base_cost * POWER(growth_rate, i));
    END LOOP;
    RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- Mettre à jour les coûts des upgrades (approximation)
UPDATE user_upgrades 
SET total_spent = (
    CASE upgrade_id
        WHEN 1 THEN calculate_upgrade_total_cost(15, 1.15, quantity)
        WHEN 2 THEN calculate_upgrade_total_cost(25, 1.15, quantity)
        WHEN 3 THEN calculate_upgrade_total_cost(50, 1.15, quantity)
        WHEN 4 THEN calculate_upgrade_total_cost(100, 1.15, quantity)
        -- Ajouter d'autres upgrades selon la configuration
        ELSE calculate_upgrade_total_cost(100, 1.15, quantity)
    END
);

-- Mettre à jour les multiplicateurs d'effets des special items
UPDATE user_special_items
SET effect_multiplier = (
    CASE special_item_id
        WHEN 2 THEN POWER(2.0, quantity)  -- AI Training+
        WHEN 3 THEN POWER(3.0, quantity)  -- Dev Certification
        WHEN 7 THEN POWER(1.5, quantity)  -- Supabase Pro
        -- Ajouter d'autres special items selon la configuration
        ELSE POWER(1.5, quantity)
    END
);

-- ===============================
-- ÉTAPE 10: VALIDATION ET NETTOYAGE
-- ===============================

-- Valider l'intégrité des données migrées
DO $$
DECLARE
    total_users_old INTEGER;
    total_users_new INTEGER;
    migration_report TEXT;
BEGIN
    -- Compter les utilisateurs avant/après
    SELECT COUNT(DISTINCT user_id) INTO total_users_old FROM migration_backup_clicker_saves;
    SELECT COUNT(*) INTO total_users_new FROM user_profiles;
    
    -- Générer un rapport de migration
    migration_report := format(
        'RAPPORT DE MIGRATION:
        - Utilisateurs avant migration: %s
        - Utilisateurs après migration: %s
        - Profils créés: %s
        - Progressions migrées: %s
        - Upgrades migrées: %s
        - Special items migrés: %s
        - Achievements migrés: %s
        - Entrées leaderboard: %s',
        total_users_old,
        total_users_new,
        (SELECT COUNT(*) FROM user_profiles),
        (SELECT COUNT(*) FROM game_progression),
        (SELECT COUNT(*) FROM user_upgrades WHERE quantity > 0),
        (SELECT COUNT(*) FROM user_special_items WHERE quantity > 0),
        (SELECT COUNT(*) FROM user_achievements),
        (SELECT COUNT(*) FROM leaderboard_entries)
    );
    
    RAISE NOTICE '%', migration_report;
END $$;

-- Vérifications d'intégrité
SELECT 'Vérification: Utilisateurs sans progression' as check_type, COUNT(*) as count
FROM user_profiles up
LEFT JOIN game_progression gp ON gp.user_id = up.id
WHERE gp.user_id IS NULL

UNION ALL

SELECT 'Vérification: Progressions orphelines' as check_type, COUNT(*) as count
FROM game_progression gp
LEFT JOIN user_profiles up ON up.id = gp.user_id
WHERE up.id IS NULL

UNION ALL

SELECT 'Vérification: Upgrades avec quantité négative' as check_type, COUNT(*) as count
FROM user_upgrades
WHERE quantity < 0

UNION ALL

SELECT 'Vérification: Power incohérent' as check_type, COUNT(*) as count
FROM game_progression
WHERE current_power > total_power * 1.1; -- Plus de 10% de tolérance

-- ===============================
-- ÉTAPE 11: NETTOYAGE OPTIONNEL
-- ===============================

-- ATTENTION: Décommenter ces lignes seulement après validation complète

-- Supprimer l'ancienne table (DANGER!)
-- DROP TABLE IF EXISTS clicker_saves;

-- Supprimer la table de sauvegarde (après validation)
-- DROP TABLE IF EXISTS migration_backup_clicker_saves;

-- Supprimer la fonction temporaire
DROP FUNCTION IF EXISTS calculate_upgrade_total_cost(DECIMAL, DECIMAL, INTEGER);

-- ===============================
-- ÉTAPE 12: OPTIMISATION POST-MIGRATION
-- ===============================

-- Analyser les tables pour optimiser les statistiques
ANALYZE user_profiles;
ANALYZE game_progression;
ANALYZE user_upgrades;
ANALYZE user_special_items;
ANALYZE user_achievements;
ANALYZE leaderboard_entries;

-- Recalculer les index
REINDEX INDEX idx_game_progression_user;
REINDEX INDEX idx_leaderboard_total_power;

COMMIT;

-- ===============================
-- RAPPORT FINAL
-- ===============================

SELECT 
    'MIGRATION TERMINÉE' as status,
    NOW() as completed_at,
    (SELECT COUNT(*) FROM user_profiles) as total_users,
    (SELECT COUNT(*) FROM game_progression) as total_progressions,
    (SELECT SUM(quantity) FROM user_upgrades) as total_upgrades_owned,
    (SELECT SUM(quantity) FROM user_special_items) as total_special_items_owned,
    (SELECT COUNT(*) FROM user_achievements) as total_achievements_unlocked;