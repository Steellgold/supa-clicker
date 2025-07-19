"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User, Save, Loader2 } from "lucide-react"
import { AuthModal } from "@/components/auth/auth-modal"
import type { Component } from "@/type/component"

export const AuthButton: Component<object> = () => {
  const { user, userProfile, signOut, loading } = useAuth()
  const handleSignOut = async () => await signOut()

  if (loading) {
    return (
      <Button size="sm" variant="retro" disabled>
        <Loader2 className="animate-spin" />
      </Button>
    )
  }

  if (user) {
    const displayName = userProfile?.username || user.email?.split("@")[0] || "User"
    
    return (
      <div className="flex items-center gap-2">
        <AuthModal>
          <Button size="sm" variant="retro" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{displayName}</span>
          </Button>
        </AuthModal>

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
