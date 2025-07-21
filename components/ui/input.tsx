import { cn } from "@/lib/utils"
import * as React from "react"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // 🌐 Retro style
          "font-mono text-sm bg-white dark:bg-neutral-800 text-black dark:text-white",
          "border-2 border-neutral-800 dark:border-neutral-300 rounded-none",
          "shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_#aaa]",

          // 💡 Placeholder & file input
          "placeholder:text-neutral-600 dark:placeholder:text-neutral-400",
          "file:border-0 file:bg-transparent file:text-sm file:font-mono",

          // 🎯 Focus
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-neutral-500 dark:focus-visible:ring-neutral-400",

          // 😴 Disabled
          "disabled:cursor-not-allowed disabled:opacity-60",

          // 📐 Layout
          "h-10 w-full px-3 py-2",

          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
