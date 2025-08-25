"use client"

import { Component } from "@/type/component"
import { User } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"

type Props = {
  username: string
  displayName?: string
  children?: React.ReactNode
  className?: string
}

export const UserProfileLink: Component<Props> = ({ username, displayName, children, className = "" }) => {
  if (children) {
    return (
      <Link href={`/${username}`} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <Link href={`/${username}`}>
      <Button variant="retro" size="sm" className={`font-mono ${className}`}>
        <User className="w-4 h-4 mr-2" />
        {displayName || username}
      </Button>
    </Link>
  )
}