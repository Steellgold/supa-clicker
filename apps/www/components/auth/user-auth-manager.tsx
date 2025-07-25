"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/auth-context"
import { Settings, User } from "lucide-react"
import { useEffect, useState } from "react"
import { ProfileEditModal } from "../dialogs/profile-edit-dialog"
import { AuthModal } from "./auth-modal"

export const UserAuthManager = () => {
  const { user, userProfile } = useAuth()
  const [, setShowProfileSetup] = useState(false)

  useEffect(() => {
    if (user && !userProfile?.username) setShowProfileSetup(true)
    else setShowProfileSetup(false)
  }, [user, userProfile])

  if (!user) {
    return (
      <AuthModal>
        <Button variant="retro" size="sm" className="font-mono font-bold">
          <User className="w-4 h-4 mr-2" />
          Login
        </Button>
      </AuthModal>
    )
  }

  return (
    <ProfileEditModal>
      <Button variant="retro" size="sm" className="font-mono font-bold">
        <Settings className="w-4 h-4 mr-2" />
        Profile
      </Button>
    </ProfileEditModal>
  )
}