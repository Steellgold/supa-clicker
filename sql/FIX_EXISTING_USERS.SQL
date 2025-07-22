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
)
SELECT 
    p.user_id,
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
FROM public.user_profiles p
LEFT JOIN public.clicker_saves cs ON p.user_id = cs.user_id
WHERE cs.user_id IS NULL;

DO $$
DECLARE
    user_record RECORD;
    random_key TEXT;
BEGIN
    FOR user_record IN 
        SELECT p.user_id 
        FROM public.user_profiles p
        LEFT JOIN public.user_crypto_keys uck ON p.user_id = uck.user_id
        WHERE uck.user_id IS NULL
    LOOP
        random_key := 'key_' || encode(gen_random_bytes(32), 'hex');
        
        INSERT INTO public.user_crypto_keys (
            user_id,
            public_key,
            created_at,
            expires_at
        ) VALUES (
            user_record.user_id,
            random_key,
            NOW(),
            NOW() + INTERVAL '30 days'
        );
    END LOOP;
    
    RAISE NOTICE 'Crypto keys created for existing users without them';
END $$;

DO $$
DECLARE
    user_count INTEGER;
    save_count INTEGER;
    key_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.user_profiles;
    SELECT COUNT(*) INTO save_count FROM public.clicker_saves;
    SELECT COUNT(*) INTO key_count FROM public.user_crypto_keys;
    
    RAISE NOTICE 'Repair completed:';
    RAISE NOTICE '- Users: %', user_count;
    RAISE NOTICE '- Saves: %', save_count;
    RAISE NOTICE '- Crypto keys: %', key_count;
    
    IF user_count = save_count AND user_count = key_count THEN
        RAISE NOTICE 'All users now have saves and crypto keys! ✓';
    ELSE
        RAISE WARNING 'Mismatch detected - some users may still be missing data';
    END IF;
END $$;

DELETE FROM public.user_crypto_keys WHERE expires_at < NOW();