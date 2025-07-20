"use client"

import { createContext, useContext, useEffect, useState, useCallback, PropsWithChildren } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Component } from "@/type/component"

type AuthContextType = {
  user: User | null
  userProfile: { username?: string; display_name?: string; bio?: string; icon_url?: string } | null
  loading: boolean
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateUsername: (username: string) => Promise<{ error?: string }>
  updateProfile: (profile: { username: string; display_name?: string | null; bio?: string | null; icon_url?: string }) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: Component<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<{ username?: string; display_name?: string; bio?: string; icon_url?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      console.log("Loading user profile for:", userId)
      
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("username, display_name, bio, avatar_url")
        .eq("user_id", userId)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("Profile not found, setting empty profile")
          setUserProfile({})
          return
        }
        
        console.error("Error loading user profile:", error)
        setUserProfile({})
        return
      }

      console.log("Profile found:", profile)
      setUserProfile({ 
        username: profile.username || undefined,
        display_name: profile.display_name || undefined,
        bio: profile.bio || undefined,
        icon_url: profile.avatar_url || undefined
      })
    } catch (error) {
      console.error("Error loading user profile:", error)
      setUserProfile({})
    }
  }, [supabase])

  useEffect(() => {
    let mounted = true
    
    const getInitialSession = async () => {
      try {
        console.log("Getting initial session...")
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error("Error getting session:", error)
          setUser(null)
          setUserProfile(null)
          setLoading(false)
          return
        }

        const currentUser = session?.user ?? null
        console.log("Initial session user:", currentUser?.id || "none")
        
        setUser(currentUser)
        
        if (currentUser) {
          try {
            await loadUserProfile(currentUser.id)
          } catch (profileError) {
            console.error("Error loading profile:", profileError)
            setUserProfile(null)
          }
        } else {
          setUserProfile(null)
        }
        
        setLoading(false)
      } catch (error) {
        console.error("Error getting initial session:", error)
        if (mounted) {
          setUser(null)
          setUserProfile(null)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log("Auth state change:", event, session?.user?.id || "no user")
          if (!mounted) return
          
          const currentUser = session?.user ?? null
          setUser(currentUser)
          
          if (currentUser) {
            setLoading(true)
            try {
              await loadUserProfile(currentUser.id)
            } catch (profileError) {
              console.error("Error loading profile:", profileError)
              setUserProfile(null)
            }
          } else {
            setUserProfile(null)
          }
          
          setLoading(false)
        } catch (error) {
          console.error("Error in auth state change:", error)
          if (mounted) {
            setUser(null)
            setUserProfile(null)
            setLoading(false)
          }
        }
      }
    )

    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn("Auth loading timeout reached, forcing loading to false")
        setLoading(false)
      }
    }, 5000)

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [supabase.auth, loadUserProfile])

  const signInWithMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          shouldCreateUser: true
        }
      })
      
      if (error) {
        console.error("Supabase auth error:", error)
        return { error: error.message }
      }
      
      console.log("Magic link sent successfully to:", email)
      return { error: undefined }
    } catch (error) {
      console.error("Unexpected error sending magic link:", error)
      return { error: "Failed to send magic link. Please try again." }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateUsername = async (username: string) => {
    return updateProfile({ username })
  }

  const updateProfile = async (profile: { username: string; display_name?: string | null; bio?: string | null; icon_url?: string }) => {
    if (!user) {
      console.error("Not logged in")
      return { error: "Not logged in" }
    }

    try {
      const { data, error } = await supabase.rpc('update_user_profile', {
        p_user_id: user.id,
        p_username: profile.username,
        p_display_name: profile.display_name || undefined,
        p_bio: profile.bio || undefined,
        p_avatar_url: profile.icon_url
      })

      if (error) {
        console.error("Profile update error:", error)
        return { error: error.message }
      }

      if (data) {
        const profileData = data as { username?: string; display_name?: string; bio?: string; avatar_url?: string }
        setUserProfile({
          username: profileData.username || undefined,
          display_name: profileData.display_name || undefined,
          bio: profileData.bio || undefined,
          icon_url: profileData.avatar_url || undefined
        })
      }

      return {}
    } catch (error) {
      console.error("Error updating profile:", error)
      return { error: "Error updating profile" }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signInWithMagicLink,
    signOut,
    updateUsername,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
