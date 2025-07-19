"use client"

import { createContext, useContext, useEffect, useState, useCallback, PropsWithChildren } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Component } from "@/type/component"

type AuthContextType = {
  user: User | null
  userProfile: { username?: string } | null
  loading: boolean
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateUsername: (username: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: Component<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<{ username?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadUserProfile = useCallback(async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      console.log("User not authenticated, skipping profile load")
      setUserProfile({})
      return
    }

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("username")
        .eq("user_id", userId)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("Creating new user profile for user:", userId)
          const { error: insertError } = await supabase
            .from("user_profiles")
            .upsert({
              user_id: userId,
              username: null
            }, {
              onConflict: "user_id"
            })
          
          if (insertError) {
            console.error("Error creating user profile:", insertError)
          } else {
            console.log("User profile created successfully")
          }
          
          setUserProfile({})
          return
        }

        if (error.code === "42P01" || error.message?.includes("406")) {
          console.warn("user_profiles table not found, please run migrations")
          setUserProfile({})
          return
        }

        console.error("Error loading user profile:", error)
        setUserProfile({})
        return
      }

      setUserProfile(
        data && data.username !== null
          ? { username: data.username }
          : {}
      )
    } catch (error) {
      console.error("Error loading user profile:", error)
      setUserProfile({})
    }
  }, [supabase])

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        await loadUserProfile(currentUser.id)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        
        if (currentUser) await loadUserProfile(currentUser.id)
        else setUserProfile(null)
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, loadUserProfile])

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error: error?.message }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateUsername = async (username: string) => {
    if (!user) {
      return { error: "Not logged in" }
    }

    try {
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          username: username,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)

      if (updateError) {
        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: user.id,
            username: username,
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          if (insertError.code === "42P01" || insertError.message?.includes("406")) {
            return { error: "Database table not ready. Please contact support or try again later." }
          }

          if (insertError.code === "23505") {
            const { error: upsertError } = await supabase
              .from("user_profiles")
              .upsert({
                user_id: user.id,
                username: username,
                updated_at: new Date().toISOString()
              }, {
                onConflict: "user_id"
              })

            if (upsertError) return { error: upsertError.message }
          } else {
            return { error: insertError.message }
          }
        }
      }

      setUserProfile({ ...userProfile, username })
      return {}
    } catch (error) {
      console.error("Error updating username:", error)
      return { error: "Error updating username" }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signInWithMagicLink,
    signOut,
    updateUsername,
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
