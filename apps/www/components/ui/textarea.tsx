import { cn } from "@/lib/utils"
import * as React from "react"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // 🧱 Retro style :
        "font-mono text-sm bg-white dark:bg-neutral-800 text-black dark:text-white border-2 border-neutral-800 dark:border-neutral-300 rounded-none px-3 py-2 shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_#aaa] outline-none",
        
        // 🛡️ Accessibility & feedback :
        "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-neutral-500 dark:focus-visible:ring-neutral-400",
        "aria-invalid:border-red-700 aria-invalid:ring-red-300 dark:aria-invalid:border-red-400 dark:aria-invalid:ring-red-500",

        // 😴 Disabled :
        "disabled:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60 dark:disabled:bg-neutral-700",

        // 📐 Default :
        "w-full min-h-16 resize-none",

        className
      )}
      {...props}
    />
  )
}

export { Textarea }
