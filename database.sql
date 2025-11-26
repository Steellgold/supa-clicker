-- ========================================
-- SUPA-CLICKER DATABASE SCHEMA
-- ========================================
-- Application: Incremental Clicker Game with Prestige System
-- Features: Game States, User Profiles, Leaderboards, Achievements
-- ========================================

-- ========================================
-- 1. EXTENSIONS
-- ========================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 2. TABLES
-- ========================================

-- Table: game_states
-- Stores the game state for each user
CREATE TABLE IF NOT EXISTS public.game_states (
    user_id UUID PRIMARY KEY,
    ppc NUMERIC NOT NULL DEFAULT 1 CHECK (ppc >= 1 AND ppc <= 1000000),
    pps NUMERIC NOT NULL DEFAULT 0 CHECK (pps >= 0 AND pps <= 10000000),
    power NUMERIC NOT NULL DEFAULT 0 CHECK (power >= 0),
    total_power NUMERIC NOT NULL DEFAULT 0 CHECK (total_power >= 0),
    upgrades JSONB NOT NULL DEFAULT '[]'::jsonb,
    prestige_level INTEGER NOT NULL DEFAULT 0 CHECK (prestige_level >= 0 AND prestige_level <= 50),
    lifetime_power NUMERIC NOT NULL DEFAULT 0 CHECK (lifetime_power >= 0),
    lifetime_clicks NUMERIC NOT NULL DEFAULT 0 CHECK (lifetime_clicks >= 0),
    unlocked_achievements TEXT[] NOT NULL DEFAULT '{}',
    prestige_stats JSONB NOT NULL DEFAULT '[]'::jsonb,
    current_prestige_start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_prestige_clicks NUMERIC NOT NULL DEFAULT 0 CHECK (current_prestige_clicks >= 0),
    current_prestige_upgrades_purchased INTEGER NOT NULL DEFAULT 0 CHECK (current_prestige_upgrades_purchased >= 0),
    current_prestige_power_spent NUMERIC NOT NULL DEFAULT 0 CHECK (current_prestige_power_spent >= 0),
    current_prestige_power_earned NUMERIC NOT NULL DEFAULT 0 CHECK (current_prestige_power_earned >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraint to ensure power doesn't exceed total_power
ALTER TABLE public.game_states
    ADD CONSTRAINT power_not_exceed_total_power
    CHECK (power <= total_power);

-- Add constraint to ensure total_power doesn't exceed lifetime_power
ALTER TABLE public.game_states
    ADD CONSTRAINT total_power_not_exceed_lifetime_power
    CHECK (total_power <= lifetime_power);

-- Table: user_profiles
-- Stores public user profile information
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraints for username validation
ALTER TABLE public.user_profiles
    ADD CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
    ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$');

-- Table: chat_messages
-- Stores public chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraint for message content length
ALTER TABLE public.chat_messages
    ADD CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 500);

-- ========================================
-- 3. INDEXES
-- ========================================

-- Indexes for game_states table
CREATE INDEX IF NOT EXISTS idx_game_states_total_power ON public.game_states(total_power DESC);
CREATE INDEX IF NOT EXISTS idx_game_states_lifetime_clicks ON public.game_states(lifetime_clicks DESC);
CREATE INDEX IF NOT EXISTS idx_game_states_prestige_level ON public.game_states(prestige_level DESC);
CREATE INDEX IF NOT EXISTS idx_game_states_updated_at ON public.game_states(updated_at DESC);

-- Indexes for user_profiles table
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at DESC);

-- Indexes for chat_messages table
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);

-- ========================================
-- 4. VIEWS
-- ========================================

-- View: chat_messages_public
-- Public view of chat messages with user information
CREATE OR REPLACE VIEW public.chat_messages_public AS
SELECT
    cm.id,
    cm.content,
    cm.created_at,
    up.username,
    up.display_name,
    up.avatar_url
FROM public.chat_messages cm
LEFT JOIN public.user_profiles up ON cm.user_id = up.id
ORDER BY cm.created_at DESC;

-- View: public_profiles
-- Public view of user profiles
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
    id as user_id,
    username,
    display_name,
    bio,
    avatar_url,
    created_at,
    updated_at
FROM public.user_profiles;

-- ========================================
-- 5. FUNCTIONS
-- ========================================

-- Function: update_updated_at_column
-- Automatically updates the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: update_user_profile
-- Updates user profile with validation
CREATE OR REPLACE FUNCTION public.update_user_profile(
    p_user_id UUID,
    p_username TEXT,
    p_display_name TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Validate username
    IF p_username IS NULL OR char_length(p_username) < 3 OR char_length(p_username) > 20 THEN
        RAISE EXCEPTION 'Username must be between 3 and 20 characters';
    END IF;

    IF p_username !~ '^[a-zA-Z0-9_-]+$' THEN
        RAISE EXCEPTION 'Username can only contain letters, numbers, underscores, and hyphens';
    END IF;

    -- Update or insert profile
    INSERT INTO public.user_profiles (id, username, display_name, bio, avatar_url)
    VALUES (p_user_id, p_username, p_display_name, p_bio, p_avatar_url)
    ON CONFLICT (id) DO UPDATE
    SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();

    -- Return updated profile
    SELECT row_to_json(up.*)
    INTO v_result
    FROM public.user_profiles up
    WHERE up.id = p_user_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 6. TRIGGERS
-- ========================================

-- Trigger: update game_states updated_at
DROP TRIGGER IF EXISTS update_game_states_updated_at ON public.game_states;
CREATE TRIGGER update_game_states_updated_at
    BEFORE UPDATE ON public.game_states
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update user_profiles updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for game_states
-- Users can only read/write their own game state
CREATE POLICY "Users can view own game state"
    ON public.game_states FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game state"
    ON public.game_states FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game state"
    ON public.game_states FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own game state"
    ON public.game_states FOR DELETE
    USING (auth.uid() = user_id);

-- Service role can read all game states (for leaderboards)
CREATE POLICY "Service role can read all game states"
    ON public.game_states FOR SELECT
    USING (auth.role() = 'service_role');

-- Policies for user_profiles
-- Anyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.user_profiles FOR SELECT
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policies for chat_messages
-- Everyone can view chat messages
CREATE POLICY "Chat messages are viewable by everyone"
    ON public.chat_messages FOR SELECT
    USING (true);

-- Authenticated users can insert messages
CREATE POLICY "Authenticated users can insert messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
    ON public.chat_messages FOR DELETE
    USING (auth.uid() = user_id);

-- ========================================
-- 8. STORAGE
-- ========================================

-- Create storage bucket for profile assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-assets', 'profile-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile-assets
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'profile-assets');

CREATE POLICY "Authenticated users can upload avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'profile-assets'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update own avatars"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'profile-assets'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own avatars"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'profile-assets'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ========================================
-- 9. SAMPLE DATA (Optional)
-- ========================================

-- Insert sample achievements data (stored in application code)
-- Achievements are validated and tracked in game_states.unlocked_achievements

-- ========================================
-- SCHEMA COMPLETE
-- ========================================
-- Tables: game_states, user_profiles, chat_messages
-- Views: chat_messages_public, public_profiles
-- Functions: update_user_profile, update_updated_at_column
-- Triggers: Auto-update updated_at timestamps
-- RLS: Full row-level security policies
-- Storage: profile-assets bucket for avatars
-- ========================================

-- Verification queries (commented out)
-- SELECT * FROM public.game_states;
-- SELECT * FROM public.user_profiles;
-- SELECT * FROM public.chat_messages_public;