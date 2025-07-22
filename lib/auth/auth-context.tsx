"use client"

import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState } from "react"

type Profile = {
  username?: string
  display_name?: string
  bio?: string
  avatar_url?: string
}

export type AuthContextType = {
  user: User | null
  userProfile: Profile | null
  loading: boolean
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateUsername: (username: string) => Promise<{ error?: string }>
  updateProfile: (profile: {
    username: string
    display_name?: string | null
    bio?: string | null
    avatar_url?: string
  }) => Promise<{ error?: string }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user ?? null)
  }

  const fetchProfile = async () => {
    if (!user) {
      setUserProfile(null)
      return
    }

    console.log("fetchProfile", user.id)

    const { data, error } = await supabase
      .from("user_profiles")
      .select("username, display_name, bio, avatar_url")
      .eq("id", user.id)
      .single()

    if (!error) {
      setUserProfile(data as Profile)
    } else {
      console.error("Erreur de récupération du profil :", error)
      setUserProfile(null)
    }
  }

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    return { error: error?.message }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
  }

  const updateUsername = async (username: string) => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ username })
      .eq("id", user?.id ?? "")
    if (!error) await fetchProfile()
    return { error: error?.message }
  }

  const updateProfile = async (profile: {
    username: string
    display_name?: string | null
    bio?: string | null
    avatar_url?: string
  }) => {
    const { error } = await supabase
      .from("user_profiles")
      .update(profile)
      .eq("id", user?.id ?? "")
    if (!error) await fetchProfile()
    return { error: error?.message }
  }

  const refreshProfile = async () => {
    await fetchProfile()
  }

  useEffect(() => {
    const init = async () => {
      await fetchUser()
      setLoading(false)
    }
    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user) fetchProfile()
    else setUserProfile(null)
  }, [user])

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signInWithMagicLink,
    signOut,
    updateUsername,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
