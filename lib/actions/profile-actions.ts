"use server"

import { createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type ProfileUpdateData = {
  username: string
  display_name?: string | null
  bio?: string | null
  avatar_url?: string | null
}

export async function updateUserProfile(profileData: ProfileUpdateData) {
  try {
    const adminClient = await createAdminClient()
    const { data: { user }, error: authError } = await adminClient.auth.getUser()
    
    if (authError || !user) {
      return { error: "Unauthorized - please login again" }
    }

    const { data, error } = await adminClient.rpc('update_user_profile', {
      p_user_id: user.id,
      p_username: profileData.username,
      p_display_name: profileData.display_name || undefined,
      p_bio: profileData.bio || undefined,
      p_avatar_url: profileData.avatar_url || undefined
    })

    if (error) {
      console.error("Profile update error:", error)
      return { error: error.message }
    }

    revalidatePath("/")
    revalidatePath(`/${profileData.username}`)
    
    return { 
      success: true,
      data: data as { username?: string; display_name?: string; bio?: string; avatar_url?: string }
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { error: "Error updating profile" }
  }
}

export const uploadProfileIcon = async(formData: FormData) => {
  try {
    const adminClient = await createAdminClient()
    const { data: { user }, error: authError } = await adminClient.auth.getUser()
    
    if (authError || !user) {
      return { error: "Unauthorized - please login again" }
    }

    const file = formData.get('file') as File
    if (!file) {
      return { error: "No file provided" }
    }

    if (file.size > 2 * 1024 * 1024) {
      return { error: "Image must be less than 2MB" }
    }

    if (!file.type.startsWith('image/')) {
      return { error: "Please select an image file" }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}_${Date.now()}.${fileExt}`
    const filePath = `profile-icons/${fileName}`

    const { error: uploadError } = await adminClient.storage
      .from('profile-assets')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: 'Failed to upload icon' }
    }

    const { data: { publicUrl } } = adminClient.storage
      .from('profile-assets')
      .getPublicUrl(filePath)

    return { success: true, publicUrl }
  } catch (error) {
    console.error("Error uploading profile icon:", error)
    return { error: "Error uploading profile icon" }
  }
}