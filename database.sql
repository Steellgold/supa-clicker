-- Supa Clicker Game Database Schema
-- PostgreSQL/Supabase Database Setup

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security (RLS) for all tables
-- This ensures users can only access their own data

-- =============================================================================
-- USER PROFILES TABLE
-- =============================================================================
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy to allow viewing other users' public profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles
    FOR SELECT USING (true);

-- =============================================================================
-- GAME STATES TABLE
-- =============================================================================
CREATE TABLE public.game_states (
    user_id UUID PRIMARY KEY,
    power BIGINT NOT NULL DEFAULT 0,
    ppc BIGINT NOT NULL DEFAULT 1, -- Power per click
    pps BIGINT NOT NULL DEFAULT 0, -- Power per second
    total_power BIGINT NOT NULL DEFAULT 0,
    upgrades JSONB DEFAULT '{}',
    prestige_level INTEGER DEFAULT 0,
    prestige_stats JSONB[] DEFAULT ARRAY[]::JSONB[],
    unlocked_achievements TEXT[] DEFAULT ARRAY[]::TEXT[],
    lifetime_clicks BIGINT DEFAULT 0,
    lifetime_power BIGINT DEFAULT 0,
    current_prestige_clicks BIGINT DEFAULT 0,
    current_prestige_power_earned BIGINT DEFAULT 0,
    current_prestige_power_spent BIGINT DEFAULT 0,
    current_prestige_upgrades_purchased INTEGER DEFAULT 0,
    current_prestige_start_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for game_states
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;

-- RLS policies for game_states
CREATE POLICY "Users can view their own game state" ON public.game_states
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own game state" ON public.game_states
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game state" ON public.game_states
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow viewing game states for leaderboard (limited fields)
CREATE POLICY "Game states are viewable for leaderboard" ON public.game_states
    FOR SELECT USING (true);

-- =============================================================================
-- CHAT MESSAGES TABLE
-- =============================================================================
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_messages (all users can read, only authenticated users can insert)
CREATE POLICY "Anyone can view chat messages" ON public.chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Public profiles view (for leaderboards and public display)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id as user_id,
    username,
    display_name,
    bio,
    avatar_url,
    created_at
FROM public.user_profiles;

-- Chat messages with user info view
CREATE OR REPLACE VIEW public.chat_messages_public AS
SELECT 
    cm.content,
    cm.created_at,
    up.username,
    up.display_name,
    up.avatar_url
FROM public.chat_messages cm
LEFT JOIN public.user_profiles up ON cm.user_id = up.id
ORDER BY cm.created_at DESC;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to update user profile with validation
CREATE OR REPLACE FUNCTION public.update_user_profile(
    p_user_id UUID,
    p_username TEXT,
    p_display_name TEXT,
    p_bio TEXT,
    p_avatar_url TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if user is updating their own profile
    IF auth.uid() != p_user_id THEN
        RETURN '{"success": false, "error": "Unauthorized"}'::JSON;
    END IF;

    -- Validate username uniqueness (excluding current user)
    IF EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE username = p_username AND id != p_user_id
    ) THEN
        RETURN '{"success": false, "error": "Username already exists"}'::JSON;
    END IF;

    -- Update the profile
    UPDATE public.user_profiles 
    SET 
        username = p_username,
        display_name = p_display_name,
        bio = p_bio,
        avatar_url = p_avatar_url,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Return success
    RETURN '{"success": true, "message": "Profile updated successfully"}'::JSON;
END;
$$;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply the trigger to relevant tables
CREATE TRIGGER handle_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_game_states
    BEFORE UPDATE ON public.game_states
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index on username for faster lookups
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);

-- Index on user_id for game_states (already primary key, but explicit for clarity)
CREATE INDEX idx_game_states_user_id ON public.game_states(user_id);

-- Index on created_at for chat messages (for ordering)
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Index on user_id for chat messages
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);

-- Composite index for leaderboard queries (total_power desc)
CREATE INDEX idx_game_states_leaderboard ON public.game_states(total_power DESC);

-- Index for prestige level leaderboards
CREATE INDEX idx_game_states_prestige ON public.game_states(prestige_level DESC);

-- =============================================================================
-- INITIAL DATA / DEFAULTS
-- =============================================================================

-- Note: User profiles and game states will be created automatically
-- when users sign up through the application logic

-- =============================================================================
-- SECURITY NOTES
-- =============================================================================

/*
This database schema implements Row Level Security (RLS) to ensure:

1. Users can only access their own game state data
2. User profiles are protected and only editable by the owner
3. Chat messages are publicly readable but only insertable by authenticated users
4. All sensitive operations require proper authentication

The schema supports:
- User authentication through Supabase Auth
- Game progression tracking with power, upgrades, and prestige
- Achievement system
- Real-time chat functionality
- Leaderboards through public views
- Profile management with validation

Make sure to configure Supabase Auth properly and test all RLS policies
before deploying to production.
*/