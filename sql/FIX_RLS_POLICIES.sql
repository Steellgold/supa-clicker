-- ===============================
-- CORRECTIF POLITIQUES RLS
-- Corrige l'erreur "only WITH CHECK expression allowed for INSERT"
-- ===============================

-- 1. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage own progression" ON game_progression;
DROP POLICY IF EXISTS "Users can manage own upgrades" ON user_upgrades;
DROP POLICY IF EXISTS "Users can manage own special items" ON user_special_items;
DROP POLICY IF EXISTS "Users can manage own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Public leaderboard read" ON leaderboard_entries;
DROP POLICY IF EXISTS "Users can update own leaderboard entry" ON leaderboard_entries;
DROP POLICY IF EXISTS "Users can modify own leaderboard entry" ON leaderboard_entries;

-- 2. Recréer les politiques avec les bonnes expressions

-- USER_PROFILES
CREATE POLICY "Users can select own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = id);

-- GAME_PROGRESSION
CREATE POLICY "Users can select own progression" ON game_progression
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progression" ON game_progression
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progression" ON game_progression
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progression" ON game_progression
    FOR DELETE USING (auth.uid() = user_id);

-- USER_UPGRADES
CREATE POLICY "Users can select own upgrades" ON user_upgrades
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own upgrades" ON user_upgrades
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own upgrades" ON user_upgrades
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own upgrades" ON user_upgrades
    FOR DELETE USING (auth.uid() = user_id);

-- USER_SPECIAL_ITEMS
CREATE POLICY "Users can select own special items" ON user_special_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own special items" ON user_special_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own special items" ON user_special_items
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own special items" ON user_special_items
    FOR DELETE USING (auth.uid() = user_id);

-- USER_ACHIEVEMENTS
CREATE POLICY "Users can select own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON user_achievements
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievements" ON user_achievements
    FOR DELETE USING (auth.uid() = user_id);

-- LEADERBOARD_ENTRIES (lecture publique, écriture privée)
CREATE POLICY "Public can read leaderboard" ON leaderboard_entries
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own leaderboard entry" ON leaderboard_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entry" ON leaderboard_entries
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leaderboard entry" ON leaderboard_entries
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ POLITIQUES RLS CORRIGÉES !';
    RAISE NOTICE '';
    RAISE NOTICE 'Les politiques RLS ont été recréées avec les bonnes expressions.';
    RAISE NOTICE 'L''erreur "only WITH CHECK expression allowed for INSERT" est résolue.';
    RAISE NOTICE '';
    RAISE NOTICE 'Vous pouvez maintenant utiliser le jeu sans erreur !';
    RAISE NOTICE '';
END $$;