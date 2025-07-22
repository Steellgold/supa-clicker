"use client"

import { AuthModal } from "@/components/auth/auth-modal"
import { ProfileEditModal } from "@/components/auth/profile-edit-modal"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/auth-context"
import type { Component } from "@/type/component"
import { Loader2, LogOut, Save, Settings, User } from "lucide-react"

export const AuthButton: Component<object> = () => {
  const { user, userProfile, signOut, loading } = useAuth()
  const handleSignOut = async () => await signOut()

  if (loading) {
    return (
      <Button size="sm" variant="retro" disabled>
        <Loader2 className="animate-spin w-4 h-4" />
      </Button>
    )
  }

  if (user) {
    const displayName = userProfile?.display_name || userProfile?.username || user.email?.split("@")[0] || "User"
    const needsProfileSetup = !userProfile

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
