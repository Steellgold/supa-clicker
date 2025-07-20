"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState, PropsWithChildren } from "react"
import type { Component } from "@/type/component"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Mail } from "lucide-react"

export const AuthModal: Component<PropsWithChildren> = ({ children }) => {
  const { signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { error: authError } = await signInWithMagicLink(email)

      if (authError) {
        setError(authError)
      } else {
        setSuccess("A magic link has been sent to your email!")
        setEmail("")
      }
    } catch {
      setError("An unexpected error occurred")
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
          <DialogTitle>Save Your Progress</DialogTitle>
          <DialogDescription>
            Enter your email to receive a magic link and save your progress.
          </DialogDescription>
        </DialogHeader>

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

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-8"
                placeholder="paul@supabase.com"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              "Send Magic Link"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}