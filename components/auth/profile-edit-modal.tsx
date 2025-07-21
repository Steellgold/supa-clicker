"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth/auth-context"
import { updateUserProfile, uploadProfileIcon } from "@/lib/actions/profile-actions"
import type { Component } from "@/type/component"
import { Loader2, Upload, User, X } from "lucide-react"
import Image from "next/image"
import { PropsWithChildren, useEffect, useRef, useState } from "react"

export const ProfileEditModal: Component<PropsWithChildren> = ({ children }) => {
  const { user, userProfile, refreshProfile, loading: authLoading } = useAuth()
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [profileIcon, setProfileIcon] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateUsername = (displayName: string): string => {
    return displayName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '')
      .trim()
      .substring(0, 20)
  }

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.display_name || userProfile.username || "")
      setUsername(userProfile.username || "")
      setBio(userProfile.bio || "")
      setIconPreview(userProfile.icon_url || null)
    } else {
      // Reset form when userProfile is null/undefined (after logout/re-login)
      setDisplayName("")
      setUsername("")
      setBio("")
      setIconPreview(null)
    }
  }, [userProfile])

  // Force refresh profile data when modal opens if profile seems empty
  useEffect(() => {
    if (isOpen && user && !authLoading && !userProfile) {
      console.log("Profile is null, refreshing...")
      refreshProfile()
    }
  }, [isOpen, user, authLoading, userProfile, refreshProfile])

  useEffect(() => {
    if (displayName && !userProfile?.username) {
      const generatedUsername = generateUsername(displayName)
      setUsername(generatedUsername)
    }
  }, [displayName, userProfile?.username])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image must be less than 2MB")
        return
      }
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file")
        return
      }
      setProfileIcon(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError("")
    }
  }

  const removeIcon = () => {
    setProfileIcon(null)
    setIconPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadIcon = async (): Promise<string | null> => {
    if (!profileIcon || !user) return null

    const formData = new FormData()
    formData.append('file', profileIcon)

    const result = await uploadProfileIcon(formData)
    
    if (result.error) {
      throw new Error(result.error)
    }

    return result.publicUrl || null
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let iconUrl = null
      if (profileIcon) {
        iconUrl = await uploadIcon()
      }

      const profileData = {
        username,
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        ...(iconUrl && { icon_url: iconUrl })
      }

      const result = await updateUserProfile(profileData)

      if (result.error) {
        setError(result.error)
      } else {
        // Refresh the profile in the auth context
        await refreshProfile()
        setIsOpen(false)
        setSuccess("Profile updated successfully!")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>
            {userProfile?.username ? "Edit Your Profile" : "Create Your Profile"}
          </DialogTitle>
          <DialogDescription>
            {userProfile?.username 
              ? "Update your profile information and customize your appearance."
              : "Set up your profile with a username, bio, and icon."}
          </DialogDescription>
        </DialogHeader>

        {user && !userProfile && !authLoading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin w-8 h-8 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">Loading your profile...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-100 border-2 border-red-400 text-red-700 p-3 rounded-none mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border-2 border-green-400 text-green-700 p-3 rounded-none mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Profile Icon</label>
            <div className="flex items-center gap-3">
              <div className="relative">
                {iconPreview ? (
                  <div className="relative w-16 h-16 border-2 border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-800">
                    <Image 
                      src={iconPreview} 
                      alt="Profile icon" 
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeIcon}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 border border-red-600 text-white text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed border-neutral-400 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-neutral-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="retro"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full font-mono text-xs"
                >
                  {iconPreview ? "CHANGE ICON" : "UPLOAD ICON"}
                </Button>
                <p className="text-xs text-neutral-500 mt-1">Max 2MB, JPG/PNG</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-8 font-mono border-2 border-neutral-800 dark:border-neutral-200 rounded-none bg-neutral-100 dark:bg-neutral-800"
                placeholder="Your display name (e.g., Gaëtan)"
                required
                minLength={1}
                maxLength={50}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              This is how your name will appear to others
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Username (URL)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 font-mono text-sm">@</span>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-8 font-mono border-2 border-neutral-800 dark:border-neutral-200 rounded-none bg-neutral-100 dark:bg-neutral-800"
                placeholder="username for URL"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-z0-9]+"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Used in your profile URL: /{username}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="font-mono border-2 border-neutral-800 dark:border-neutral-200 rounded-none bg-neutral-100 dark:bg-neutral-800 resize-none"
              placeholder="Tell others about yourself..."
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-neutral-500 mt-1">{bio.length}/200 characters</p>
          </div>

          <Button 
            type="submit" 
            variant="retro"
            className="w-full font-mono font-bold" 
            disabled={loading || username.length < 3 || displayName.length < 1}
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : userProfile?.username ? (
              "UPDATE PROFILE"
            ) : (
              "CREATE PROFILE"
            )}
          </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}