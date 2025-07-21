"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User, Save, Loader2, Settings } from "lucide-react"
import { AuthModal } from "@/components/auth/auth-modal"
import { ProfileEditModal } from "@/components/auth/profile-edit-modal"
import type { Component } from "@/type/component"
import { useEffect, useState } from "react"

export const AuthButton: Component<object> = () => {
  const { user, userProfile, signOut, loading } = useAuth()
  const [timeoutReached, setTimeoutReached] = useState(false)
  const handleSignOut = async () => await signOut()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('AuthButton: Loading timeout reached, forcing to show content')
        setTimeoutReached(true)
      }
    }, 3000) // 3 secondes seulement

    return () => clearTimeout(timeoutId)
  }, [loading])

  if (loading && !timeoutReached) {
    return (
      <Button size="sm" variant="retro" disabled>
        <Loader2 className="animate-spin w-4 h-4" />
      </Button>
    )
  }

  if (user) {
    const displayName = userProfile?.display_name || userProfile?.username || user.email?.split("@")[0] || "User"
    const needsProfileSetup = !userProfile || !userProfile.username

    return (
      <div className="flex items-center gap-2">
        <ProfileEditModal>
          <Button 
            size="sm" 
            variant="retro" 
            className={`flex items-center gap-2 ${needsProfileSetup ? 'bg-yellow-400 text-neutral-900 border-yellow-600' : ''}`}
          >
            {needsProfileSetup ? (
              <>
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline font-mono">SETUP PROFILE</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{displayName}</span>
              </>
            )}
          </Button>
        </ProfileEditModal>

        <Button size="sm" variant="retro" onClick={handleSignOut}>
          <LogOut />
          <span className="hidden sm:inline ml-2">Sign Out</span>
        </Button>
      </div>
    )
  }

  return (
    <AuthModal>
      <Button size="sm" variant="retro">
        <Save />
        Save Progress
      </Button>
    </AuthModal>
  )
}
