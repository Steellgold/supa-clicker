DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();
DROP FUNCTION IF EXISTS get_leaderboard(text, integer);
DROP FUNCTION IF EXISTS get_user_rank(uuid, text);
DROP VIEW IF EXISTS leaderboard_view;
DROP TABLE IF EXISTS clicker_saves;
DROP TABLE IF EXISTS user_crypto_keys;
DROP TABLE IF EXISTS user_profiles;

CREATE TABLE public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.clicker_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_power BIGINT DEFAULT 0,
    total_power BIGINT DEFAULT 0,
    total_clicks BIGINT DEFAULT 0,
    clicks_per_second NUMERIC DEFAULT 0,
    prestige_level INTEGER DEFAULT 0,
    upgrades JSONB DEFAULT '{}'::jsonb,
    special_items JSONB DEFAULT '{}'::jsonb,
    achievements JSONB DEFAULT '{}'::jsonb,
    last_save_time BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT clicker_saves_user_id_unique UNIQUE (user_id)
);

CREATE TABLE public.user_crypto_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    public_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour') NOT NULL,
    
    CONSTRAINT user_crypto_keys_user_id_unique UNIQUE (user_id)
);

CREATE INDEX idx_clicker_saves_total_power ON public.clicker_saves(total_power DESC);
CREATE INDEX idx_clicker_saves_total_clicks ON public.clicker_saves(total_clicks DESC);
CREATE INDEX idx_clicker_saves_prestige_level ON public.clicker_saves(prestige_level DESC);
CREATE INDEX idx_clicker_saves_user_id ON public.clicker_saves(user_id);

CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_user_profiles_created_at ON public.user_profiles(created_at);

CREATE INDEX idx_user_crypto_keys_user_id ON public.user_crypto_keys(user_id);
CREATE INDEX idx_user_crypto_keys_expires_at ON public.user_crypto_keys(expires_at);

CREATE VIEW public.leaderboard_view AS
SELECT 
    p.user_id,
    p.username,
    p.display_name,
    COALESCE(cs.current_power, 0) as current_power,
    COALESCE(cs.total_power, 0) as total_power,
    COALESCE(cs.total_clicks, 0) as total_clicks,
    COALESCE(cs.clicks_per_second, 0) as clicks_per_second,
    COALESCE(cs.prestige_level, 0) as prestige_level,
    COALESCE(jsonb_array_length(cs.achievements), 0) as achievements_count,
    COALESCE(cs.updated_at, p.created_at) as updated_at
FROM public.user_profiles p
LEFT JOIN public.clicker_saves cs ON p.user_id = cs.user_id;

CREATE OR REPLACE FUNCTION public.get_leaderboard(
    order_by TEXT DEFAULT 'total_power',
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    display_name TEXT,
    current_power BIGINT,
    total_power BIGINT,
    total_clicks BIGINT,
    clicks_per_second NUMERIC,
    prestige_level INTEGER,
    achievements_count INTEGER,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    CASE order_by
        WHEN 'total_power' THEN
            RETURN QUERY
            SELECT * FROM public.leaderboard_view
            ORDER BY leaderboard_view.total_power DESC, leaderboard_view.updated_at DESC
            LIMIT limit_count;
            
        WHEN 'total_clicks' THEN
            RETURN QUERY
            SELECT * FROM public.leaderboard_view
            ORDER BY leaderboard_view.total_clicks DESC, leaderboard_view.updated_at DESC
            LIMIT limit_count;
            
        WHEN 'prestige_level' THEN
            RETURN QUERY
            SELECT * FROM public.leaderboard_view
            ORDER BY leaderboard_view.prestige_level DESC, leaderboard_view.total_power DESC, leaderboard_view.updated_at DESC
            LIMIT limit_count;
            
        ELSE
            RETURN QUERY
            SELECT * FROM public.leaderboard_view
            ORDER BY leaderboard_view.total_power DESC, leaderboard_view.updated_at DESC
            LIMIT limit_count;
    END CASE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_user_rank(
    target_user_id UUID,
    order_by TEXT DEFAULT 'total_power'
)
RETURNS TABLE (
    rank_position BIGINT,
    user_data JSON
) AS $$
DECLARE
    user_rank BIGINT;
    user_info JSON;
BEGIN
    SELECT to_json(lv.*) INTO user_info
    FROM public.leaderboard_view lv
    WHERE lv.user_id = target_user_id;
    
    IF user_info IS NULL THEN
        RETURN QUERY SELECT NULL::BIGINT, NULL::JSON;
        RETURN;
    END IF;
    
    CASE order_by
        WHEN 'total_power' THEN
            SELECT COUNT(*) + 1 INTO user_rank
            FROM public.leaderboard_view lv
            WHERE lv.total_power > (user_info->>'total_power')::BIGINT
               OR (lv.total_power = (user_info->>'total_power')::BIGINT 
                   AND lv.updated_at < (user_info->>'updated_at')::TIMESTAMPTZ);
                   
        WHEN 'total_clicks' THEN
            SELECT COUNT(*) + 1 INTO user_rank
            FROM public.leaderboard_view lv
            WHERE lv.total_clicks > (user_info->>'total_clicks')::BIGINT
               OR (lv.total_clicks = (user_info->>'total_clicks')::BIGINT 
                   AND lv.updated_at < (user_info->>'updated_at')::TIMESTAMPTZ);
                   
        WHEN 'prestige_level' THEN
            SELECT COUNT(*) + 1 INTO user_rank
            FROM public.leaderboard_view lv
            WHERE lv.prestige_level > (user_info->>'prestige_level')::INTEGER
               OR (lv.prestige_level = (user_info->>'prestige_level')::INTEGER 
                   AND lv.total_power > (user_info->>'total_power')::BIGINT)
               OR (lv.prestige_level = (user_info->>'prestige_level')::INTEGER 
                   AND lv.total_power = (user_info->>'total_power')::BIGINT
                   AND lv.updated_at < (user_info->>'updated_at')::TIMESTAMPTZ);
                   
        ELSE
            SELECT COUNT(*) + 1 INTO user_rank
            FROM public.leaderboard_view lv
            WHERE lv.total_power > (user_info->>'total_power')::BIGINT
               OR (lv.total_power = (user_info->>'total_power')::BIGINT 
                   AND lv.updated_at < (user_info->>'updated_at')::TIMESTAMPTZ);
    END CASE;
    
    RETURN QUERY SELECT user_rank, user_info;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    default_username TEXT;
    user_email TEXT;
    user_metadata JSONB;
    profile_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.user_profiles WHERE user_id = NEW.id
    ) INTO profile_exists;
    
    IF profile_exists THEN
        RETURN NEW;
    END IF;
    
    user_email := COALESCE(NEW.email, '');
    user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    
    default_username := COALESCE(
        user_metadata->>'username',
        user_metadata->>'display_name', 
        user_metadata->>'full_name',
        CASE 
            WHEN user_email != '' THEN split_part(user_email, '@', 1)
            ELSE 'user_' || substring(NEW.id::text, 1, 8)
        END
    );
    
    WHILE EXISTS(SELECT 1 FROM public.user_profiles WHERE username = default_username) LOOP
        default_username := default_username || '_' || floor(random() * 1000)::text;
    END LOOP;
    
    INSERT INTO public.user_profiles (
        user_id,
        username,
        display_name,
        bio,
        avatar_url,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        default_username,
        user_metadata->>'display_name',
        NULL,
        user_metadata->>'avatar_url',
        NOW(),
        NOW()
    );
    
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
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        0,
        0,
        0,
        0,
        0,
        '{}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb,
        extract(epoch from NOW()) * 1000,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicker_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_crypto_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own save" ON public.clicker_saves
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own save" ON public.clicker_saves
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own save" ON public.clicker_saves
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own save" ON public.clicker_saves
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own crypto keys" ON public.user_crypto_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own crypto keys" ON public.user_crypto_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crypto keys" ON public.user_crypto_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crypto keys" ON public.user_crypto_keys
    FOR DELETE USING (auth.uid() = user_id);

CREATE VIEW public.public_profiles AS
SELECT 
    user_id,
    username,
    display_name,
    bio,
    avatar_url,
    created_at
FROM public.user_profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles
    FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.cleanup_expired_crypto_keys()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_crypto_keys 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    RAISE NOTICE 'SupaClicker database setup completed successfully!';
    RAISE NOTICE 'Tables created: user_profiles, clicker_saves, user_crypto_keys';
    RAISE NOTICE 'Views created: leaderboard_view, public_profiles';
    RAISE NOTICE 'Functions created: get_leaderboard, get_user_rank, create_user_profile';
    RAISE NOTICE 'Triggers created: on_auth_user_created';
    RAISE NOTICE 'RLS policies configured for all tables';
END $$;