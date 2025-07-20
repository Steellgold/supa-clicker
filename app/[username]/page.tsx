"use client";

import { use, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Zap, MousePointer } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getAllUpgrades } from '@/lib/upgrades';
import { getAllAchievements } from '@/lib/achievements';
import type { Upgrade } from '@/type/game';
import { Component } from '@/type/component';
import { PRESTIGE_IMAGES } from '@/lib/config/prestige-images';

type UserProfile = {
  username: string;
  avatar_url?: string | null;
  display_name?: string | null;
  bio?: string | null;
  created_at: string;
}

type UserStats = {
  total_clicks: number;
  total_power: number;
  clicks_per_second: number;
  prestige_level: number;
  achievements_count: number;
  updated_at: string;
}

type UserGameData = {
  upgrades: Record<number, number>;
  specialItems: Record<number, number>;
  unlockedAchievements: number[];
  totalClicks: number;
  totalPower: number;
  prestigeLevel: number;
}

interface Props {
  params: Promise<{ username: string }>;
}

const UserProfilePage: Component<Props> = ({ params }) => {
  const { username } = use(params)

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [gameData, setGameData] = useState<UserGameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const allUpgrades = getAllUpgrades();
  const allAchievements = getAllAchievements();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        console.log('Loading profile for username:', username);
        setLoading(true);
        
        // Check if username is actually a UUID (user_id)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
        console.log('Is UUID:', isUUID);
        
        // Get user profile
        console.log('Fetching user profile...');
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('username, avatar_url, display_name, created_at, user_id')
          .eq(isUUID ? 'user_id' : 'username', username)
          .single();

        console.log('Profile data:', profileData, 'Error:', profileError);

        if (profileError) {
          console.error('Profile error:', profileError);
          setError(`User not found: ${profileError.message}`);
          return;
        }

        if (!profileData) {
          setError('User not found');
          return;
        }

        setProfile({
          username: profileData.username!,
          avatar_url: profileData.avatar_url,
          display_name: profileData.display_name,
          created_at: profileData.created_at
        });
        console.log('Profile set successfully');

        // Get leaderboard stats using the view
        console.log('Fetching leaderboard stats...');
        const actualUsername = profileData.username!;
        
        const { data: statsData, error: statsError } = await supabase
          .from('leaderboard_view')
          .select('total_clicks, total_power, clicks_per_second, prestige_level, achievements_count, updated_at')
          .eq('username', actualUsername)
          .maybeSingle();

        console.log('Stats data:', statsData, 'Error:', statsError);

        if (!statsError && statsData) {
          setStats({
            total_clicks: statsData.total_clicks || 0,
            total_power: statsData.total_power || 0,
            clicks_per_second: statsData.clicks_per_second || 0,
            prestige_level: statsData.prestige_level || 0,
            achievements_count: statsData.achievements_count || 0,
            updated_at: statsData.updated_at || new Date().toISOString()
          });
        }

        // Get public game data from the public view
        console.log('Fetching public game data for username:', actualUsername);
        try {
          const { data: publicProfileData, error: publicError } = await supabase
            .from('public_profiles')
            .select('total_clicks, total_power, prestige_level, unlocked_achievements, upgrades, special_items, last_played')
            .eq('username', actualUsername)
            .maybeSingle();

          console.log('Public profile data:', publicProfileData, 'Error:', publicError);

          if (!publicError && publicProfileData) {
            if (publicProfileData.unlocked_achievements || publicProfileData.upgrades) {
              setGameData({
                totalClicks: parseInt(String(publicProfileData.total_clicks)) || 0,
                totalPower: parseInt(String(publicProfileData.total_power)) || 0,
                prestigeLevel: parseInt(String(publicProfileData.prestige_level)) || 0,
                unlockedAchievements: publicProfileData.unlocked_achievements ? 
                  (Array.isArray(publicProfileData.unlocked_achievements) ? 
                    publicProfileData.unlocked_achievements : 
                    JSON.parse(publicProfileData.unlocked_achievements as string)
                  ) : [],
                upgrades: publicProfileData.upgrades ? 
                  (typeof publicProfileData.upgrades === 'object' ? 
                    publicProfileData.upgrades : 
                    JSON.parse(publicProfileData.upgrades as string)
                  ) : {},
                specialItems: publicProfileData.special_items ? 
                  (typeof publicProfileData.special_items === 'object' ? 
                    publicProfileData.special_items : 
                    JSON.parse(publicProfileData.special_items as string)
                  ) : {}
              });
            }
          } else {
            console.log('No public game data available for this user');
          }
        } catch (err) {
          console.log('Error fetching public profile data:', err);
        }

      } catch (err) {
        console.error('Unexpected error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        console.log('Profile loading completed');
        setLoading(false);
      }
    };

    if (username) {
      loadUserProfile();
    }
  }, [username, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="border-2 border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-800 p-8 text-center">
            <div className="font-mono text-lg text-neutral-700 dark:text-neutral-300">
              LOADING PROFILE FOR: {username}
            </div>
            <div className="font-mono text-sm text-neutral-500 mt-2">
              Check console for debug info...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="border-2 border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-800 p-8 text-center">
            <div className="font-mono text-lg text-red-700 dark:text-red-300 mb-4">
              {error || 'PROFILE NOT FOUND'}
            </div>
            <Button
              onClick={() => router.back()}
              variant="retro"
              className="font-mono font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              GO BACK
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const userUpgrades = gameData?.upgrades ? Object.entries(gameData.upgrades)
    .map(([id, level]) => {
      const upgrade = allUpgrades.find(u => u.id === parseInt(id));
      return upgrade ? { ...upgrade, level } : null;
    })
    .filter(Boolean) as (Upgrade & { level: number })[] : [];

  const userSpecialItems = gameData?.specialItems ? Object.entries(gameData.specialItems)
    .map(([id, level]) => ({ id: parseInt(id), level }))
    .filter(item => item.level > 0) : [];

  const userAchievements = gameData?.unlockedAchievements 
    ? allAchievements.filter(a => gameData.unlockedAchievements.includes(a.id))
    : [];

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="retro"
            size="sm"
            className="font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            USER PROFILE
          </h1>
        </div>

        {/* Profile Card */}
        <div className="border-2 border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-800">
          <div className="p-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={`${profile.username}'s avatar`}
                    width={96}
                    height={96}
                    className="w-24 h-24 border-2 border-neutral-800 dark:border-neutral-200 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 border-2 border-neutral-800 dark:border-neutral-200 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <span className="font-mono text-2xl text-neutral-600 dark:text-neutral-400">
                      {profile.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="font-mono text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {profile.display_name || profile.username}
                </h1>
                <p className="font-mono text-lg text-neutral-600 dark:text-neutral-400 mb-3">
                  @{profile.username}
                </p>
                {profile.bio && (
                  <p className="font-mono text-neutral-700 dark:text-neutral-300 mb-3 p-3 border border-neutral-600 dark:border-neutral-400 bg-neutral-50 dark:bg-neutral-800">
                    {profile.bio}
                  </p>
                )}
                <p className="font-mono text-sm text-neutral-600 dark:text-neutral-400">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Prestige Badge */}
              {stats && stats.prestige_level > 0 && (
                <div className="flex-shrink-0">
                  <div className="border-2 border-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src={PRESTIGE_IMAGES[stats.prestige_level as keyof typeof PRESTIGE_IMAGES]}
                        alt={`Prestige ${stats.prestige_level}`}
                        width={24}
                        height={24}
                        priority
                      />
                      <span className="font-mono font-bold text-yellow-800 dark:text-yellow-200">
                        PRESTIGE {stats.prestige_level}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border-2 border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-800 p-4">
              <div className="flex items-center gap-3">
                <MousePointer className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400 uppercase">
                    Total Clicks
                  </div>
                  <div className="font-mono text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {formatNumber(stats.total_clicks)}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-800 p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-600" />
                <div>
                  <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400 uppercase">
                    Total Power
                  </div>
                  <div className="font-mono text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {formatNumber(stats.total_power)}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-800 p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400 uppercase">
                    Power/Sec
                  </div>
                  <div className="font-mono text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {formatNumber(stats.clicks_per_second)}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-800 p-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-purple-600" />
                <div>
                  <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400 uppercase">
                    Achievements
                  </div>
                  <div className="font-mono text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {userAchievements.length} / {allAchievements.length}
                  </div>
                  <div className="w-full bg-neutral-300 dark:bg-neutral-600 h-2 rounded mt-1">
                    <div 
                      className="bg-purple-600 h-2 rounded transition-all"
                      style={{ width: `${(userAchievements.length / allAchievements.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="border-2 border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-800">
          <div className="p-4 border-b-2 border-neutral-800 dark:border-neutral-200 bg-neutral-200 dark:bg-neutral-700">
            <h3 className="font-mono font-bold text-neutral-900 dark:text-neutral-100 uppercase">
              🏆 Achievements ({userAchievements.length}/{allAchievements.length})
            </h3>
            <div className="w-full bg-neutral-400 dark:bg-neutral-600 h-2 rounded mt-2">
              <div 
                className="bg-yellow-500 h-2 rounded transition-all"
                style={{ width: `${(userAchievements.length / allAchievements.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="p-4">
            {userAchievements.length === 0 ? (
              <div className="text-center py-8">
                <div className="font-mono text-sm text-neutral-600 dark:text-neutral-400">
                  No achievements unlocked yet.
                  {!gameData && <div className="mt-2">Game data not available.</div>}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {userAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="border-2 border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 text-center"
                  >
                    <div className="text-3xl mb-1">{achievement.icon}</div>
                    <div className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                      {achievement.name}
                    </div>
                    <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                      {achievement.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Special Items */}
        {userSpecialItems.length > 0 && (
          <div className="border-2 border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-800">
            <div className="p-4 border-b-2 border-neutral-800 dark:border-neutral-200 bg-neutral-200 dark:bg-neutral-700">
              <h3 className="font-mono font-bold text-neutral-900 dark:text-neutral-100 uppercase">
                ✨ Special Items ({userSpecialItems.length})
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {userSpecialItems.map((item) => (
                  <div
                    key={item.id}
                    className="border-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20 p-3 text-center"
                  >
                    <div className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                      Special Item #{item.id}
                    </div>
                    <div className="font-mono text-lg font-bold text-purple-600 dark:text-purple-400">
                      LVL {item.level}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upgrades */}
        <div className="border-2 border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-800">
          <div className="p-4 border-b-2 border-neutral-800 dark:border-neutral-200 bg-neutral-200 dark:bg-neutral-700">
            <h3 className="font-mono font-bold text-neutral-900 dark:text-neutral-100 uppercase">
              ⚙️ Upgrades ({userUpgrades.length})
            </h3>
          </div>
          <div className="p-4">
            {userUpgrades.length === 0 ? (
              <div className="text-center py-8">
                <div className="font-mono text-sm text-neutral-600 dark:text-neutral-400">
                  No upgrades purchased yet.
                  {!gameData && <div className="mt-2">Game data not available.</div>}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userUpgrades
                  .sort((a, b) => b.level - a.level)
                  .map((upgrade) => (
                    <div
                      key={upgrade.id}
                      className="border border-neutral-600 dark:border-neutral-400 bg-neutral-50 dark:bg-neutral-700 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
                            {upgrade.name}
                          </div>
                          <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                            {upgrade.description}
                          </div>
                          <div className="font-mono text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Category: {upgrade.category}
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <div className="font-mono text-lg font-bold text-green-600 dark:text-green-400">
                            LVL {upgrade.level}
                          </div>
                          <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                            {upgrade.rpsGain > 0 && (
                              <div>+{(upgrade.rpsGain * upgrade.level).toFixed(1)} RPS</div>
                            )}
                            {upgrade.clickMultiplier > 0 && (
                              <div>+{(upgrade.clickMultiplier * upgrade.level).toFixed(1)}x CLICK</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Back to Game */}
        <div className="text-center">
          <Link href="/">
            <Button variant="retro" className="font-mono font-bold">
              BACK TO GAME
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;