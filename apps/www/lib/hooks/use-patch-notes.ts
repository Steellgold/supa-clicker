"use client"

import { useEffect, useState } from "react";

export type PatchNoteItem = {
  type: "ADDED" | "CHANGED" | "FIXED" | "REMOVED"| "REFACTORED" | "IMPROVED" | "REMOVED";
  description: string;
};

export type PatchNoteCategory = {
  title: string;
  items: PatchNoteItem[];
};

export type PatchNote = {
  version: string;
  date: string;
  title: string;
  excerpt: string;
  github_url: string;
  categories: PatchNoteCategory[];
};

export function usePatchNotes() {
  const [patchNotes, setPatchNotes] = useState<PatchNote[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const compareVersions = (a: string, b: string): number => {
    const aParts = a.split(".").map(Number)
    const bParts = b.split(".").map(Number)

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0
      const bPart = bParts[i] || 0

      if (aPart > bPart) return 1
      if (aPart < bPart) return -1
    }
    return 0
  }

  const loadPatchNotes = async () => {
    try {
      setLoading(true)

      const indexResponse = await fetch("/patch-notes/index.json")
      if (!indexResponse.ok) {
        throw new Error("Failed to load patch notes index")
      }

      const { versions } = await indexResponse.json()
      const notes: PatchNote[] = []

      for (const version of versions) {
        try {
          const response = await fetch(`/patch-notes/${version}.json`)
          if (response.ok) {
            const note = await response.json()
            notes.push(note)
          }
        } catch (error) {
          console.error(error)
          console.warn(`Failed to load patch note for version ${version}`)
        }
      }

      notes.sort((a, b) => compareVersions(b.version, a.version))
      setPatchNotes(notes)

      if (notes.length > 0) {
        const latestVersion = notes[0].version
        const lastSeenVersion = localStorage.getItem("last-seen-patch-version")

        if (!lastSeenVersion || compareVersions(latestVersion, lastSeenVersion) > 0) {
          setIsOpen(true)
        }
      }
    } catch (error) {
      console.error("Failed to load patch notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = () => {
    if (patchNotes.length > 0) {
      localStorage.setItem("last-seen-patch-version", patchNotes[0].version)
    }
    setIsOpen(false)
  }

  const goToNext = () => {
    if (currentIndex < patchNotes.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToVersion = (index: number) => {
    if (index >= 0 && index < patchNotes.length) {
      setCurrentIndex(index)
    }
  }

  useEffect(() => {
    loadPatchNotes()
  }, [])

  return {
    patchNotes,
    currentPatchNote: patchNotes[currentIndex],
    currentIndex,
    isOpen,
    loading,
    setIsOpen,
    markAsRead,
    goToNext,
    goToPrevious,
    goToVersion,
    hasNext: currentIndex < patchNotes.length - 1,
    hasPrevious: currentIndex > 0,
    reload: loadPatchNotes,
  }
}