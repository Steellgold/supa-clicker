"use client"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePatchNotes } from "@/lib/hooks/use-patch-notes"
import { Component } from "@/type/component"
import { Bug, ChevronLeft, ChevronRight, Github, NotepadText, Plus, Trash2, Wrench } from "lucide-react"
import Link from "next/link"

const changeTypeConfig = {
  ADDED: { icon: Plus, color: "text-green-600", bgColor: "bg-green-50", label: "New" },
  CHANGED: { icon: Wrench, color: "text-blue-600", bgColor: "bg-blue-50", label: "Changed" },
  FIXED: { icon: Bug, color: "text-orange-600", bgColor: "bg-orange-50", label: "Fixed" },
  REMOVED: { icon: Trash2, color: "text-red-600", bgColor: "bg-red-50", label: "Removed" },
  REFACTORED: { icon: Wrench, color: "text-purple-600", bgColor: "bg-purple-50", label: "Refactored" },
  IMPROVED: { icon: Wrench, color: "text-yellow-600", bgColor: "bg-yellow-50", label: "Improved" },
}

type DialogProps = {
  showOpenButton?: boolean
}

export const PatchNotesDialog: Component<DialogProps> = ({ showOpenButton = false }) => {
  const {
    patchNotes,
    currentPatchNote,
    currentIndex,
    isOpen,
    loading,
    setIsOpen,
    markAsRead,
    goToNext,
    goToPrevious,
    goToVersion,
    hasNext,
    hasPrevious,
  } = usePatchNotes()

  if (loading || !currentPatchNote) {
    return <></>
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {showOpenButton && (
        <Button onClick={() => setIsOpen(true)} variant="retro" size="sm" className="shadow-none border-1">
          <NotepadText />
        </Button>
      )}

      <DialogContent className="max-w-md max-h-[85vh] p-0">
        <DialogHeader className="p-4 pb-2 space-y-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Select
                value={currentPatchNote.version}
                onValueChange={(version) => {
                  const index = patchNotes.findIndex((note) => note.version === version)
                  if (index !== -1) goToVersion(index)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {patchNotes.map((note) => (
                    <SelectItem key={note.version} value={note.version}>
                      v{note.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-left">
            <DialogTitle className="text-lg font-semibold">{currentPatchNote.title}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{currentPatchNote.excerpt}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(currentPatchNote.date).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 max-h-[400px]">
          <div className="space-y-4 pb-4">
            {currentPatchNote.categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-2">
                <h3 className="font-medium text-sm text-foreground border-b pb-1">{category.title}</h3>

                <div className="space-y-1">
                  {category.items.map((item, itemIndex) => {
                    const config = changeTypeConfig[item.type]
                    const Icon = config.icon

                    return (
                      <div key={itemIndex} className={`p-3 ${config.bgColor} border`}>
                        <div className="flex items-start gap-2">
                          <div className={`rounded-full p-1 ${config.color} flex-shrink-0 mt-0.5`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={!hasPrevious}
              className="flex items-center gap-1 bg-transparent"
            >
              <ChevronLeft className="h-3 w-3" />
              {hasPrevious && patchNotes[currentIndex + 1] ? `v${patchNotes[currentIndex + 1].version}` : ""}
            </Button>

            <div className="flex items-center gap-1">
              <Button onClick={markAsRead} size="sm">
                Mark as read
              </Button>

              <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={currentPatchNote.github_url} target="_blank">
                <Github />
              </Link>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={!hasNext}
              className="flex items-center gap-1 bg-transparent"
            >
              {hasNext && patchNotes[currentIndex - 1] ? `v${patchNotes[currentIndex - 1].version}` : ""}
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}