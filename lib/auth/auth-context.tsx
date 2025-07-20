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
      const { data: existingProfile, error: selectError } = await supabase
        .from("user_profiles")
        .select("username, display_name, bio, avatar_url")
        .eq("user_id", userId)
        .single()

      if (selectError && selectError.code !== "PGRST116") {
        console.error("Error loading user profile:", selectError)
        setUserProfile({})
        return
      }

      if (existingProfile) {
        console.log("Profile found:", existingProfile)
        setUserProfile({ 
          username: existingProfile.username || undefined,
          display_name: existingProfile.display_name || undefined,
          bio: existingProfile.bio || undefined,
          icon_url: existingProfile.avatar_url || undefined
        })
        return
      }

      // Profile doesn't exist, create it
      console.log("Creating new profile for user:", userId)
      
      // Get current user to extract email and metadata
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      const email = currentUser?.email || ''
      const metadata = currentUser?.user_metadata || {}
      
      // Generate a default username from email
      const defaultUsername = metadata.username || 
                              metadata.display_name || 
                              metadata.full_name || 
                              email.split('@')[0] || 
                              `user_${userId.slice(0, 8)}`

      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: userId,
          username: defaultUsername,
          display_name: metadata.display_name || metadata.full_name || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error("Error creating user profile:", insertError)
        
        // If it's a duplicate key error, try to fetch the existing profile
        if (insertError.code === "23505") {
          console.log("Profile already exists (race condition), trying to fetch it")
          const { data: retryProfile } = await supabase
            .from("user_profiles")
            .select("username, display_name, bio, avatar_url")
            .eq("user_id", userId)
            .single()
            
          if (retryProfile) {
            setUserProfile({ 
              username: retryProfile.username || undefined,
              display_name: retryProfile.display_name || undefined,
              bio: retryProfile.bio || undefined,
              icon_url: retryProfile.avatar_url || undefined
            })
            return
          }
        }
        
        setUserProfile({})
        return
      }

      console.log("Profile created successfully with username:", defaultUsername)
      setUserProfile({ username: defaultUsername, display_name: undefined, bio: undefined, icon_url: undefined })
    } catch (error) {
      console.error("Error loading user profile:", error)
      setUserProfile({})
    }
  }, [supabase])

  useEffect(() => {
    let mounted = true
    
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn("Auth loading timeout reached, forcing loading to false")
        setLoading(false)
      }
    }, 10000) // 10 secondes

    const getInitialSession = async () => {
      try {
        console.log("Getting initial session...")
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error getting session:", error)
          if (mounted) {
            setUser(null)
            setUserProfile(null)
            setLoading(false)
          }
          return
        }

        const currentUser = session?.user ?? null
        console.log("Initial session user:", currentUser?.id || "none")
        
        if (mounted) {
          setUser(currentUser)
          
          if (currentUser) {
            await loadUserProfile(currentUser.id)
          } else {
            setUserProfile(null)
          }
          setLoading(false)
        }
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
            await loadUserProfile(currentUser.id)
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

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [supabase.auth, loadUserProfile])

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) console.error("Supabase auth error:", error)
    else console.log("Sign in with magic link initiated successfully for:", email)
    
    return { error: error?.message }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateUsername = async (username: string) => {
    return updateProfile({ username })
  }

  const updateProfile = async (profile: { username: string; display_name?: string | null; bio?: string | null; icon_url?: string }) => {
    if (!user) {
      return { error: "Not logged in" }
    }

    try {
      const updateData = {
        username: profile.username,
        updated_at: new Date().toISOString(),
        ...(profile.display_name !== undefined && { display_name: profile.display_name }),
        ...(profile.bio !== undefined && { bio: profile.bio }),
        ...(profile.icon_url && { avatar_url: profile.icon_url })
      }

      const { error: updateError } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("user_id", user.id)

      if (updateError) {
        const insertData = {
          user_id: user.id,
          ...updateData
        }

        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert(insertData)

        if (insertError) {
          if (insertError.code === "42P01" || insertError.message?.includes("406")) {
            return { error: "Database table not ready. Please contact support or try again later." }
          }

          if (insertError.code === "23505") {
            const { error: upsertError } = await supabase
              .from("user_profiles")
              .upsert(insertData, {
                onConflict: "user_id"
              })

            if (upsertError) return { error: upsertError.message }
          } else {
            return { error: insertError.message }
          }
        }
      }

      await loadUserProfile(user.id)
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
