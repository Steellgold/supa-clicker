import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border border-neutral-800 dark:border-neutral-200 bg-white text-black dark:bg-neutral-800 dark:text-white rounded-none shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_#aaa] hover:bg-neutral-100 dark:hover:bg-neutral-700 font-mono",
        destructive:
          "bg-[#ffcccc] text-[#5a0000] border-2 border-[#5a0000] rounded-none font-mono shadow-[3px_3px_0_#5a0000] hover:bg-[#ffaaaa] dark:bg-[#802222] dark:text-[#ffdddd] dark:border-[#ff9999] dark:hover:bg-[#a23333]",
        outline:
          "border border-neutral-800 dark:border-neutral-200 bg-transparent text-black dark:text-white rounded-none shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_#aaa] hover:bg-neutral-100 dark:hover:bg-neutral-700 font-mono",
        secondary:
          "bg-[#dddddd] text-black border-2 border-[#444] rounded-none font-mono shadow-[3px_3px_0_#444] hover:bg-[#cccccc] dark:bg-[#333] dark:text-white dark:border-[#aaa] dark:hover:bg-[#555]",
        ghost:
          "bg-transparent text-black dark:text-white border-2 border-dashed border-[#666] dark:border-[#aaa] rounded-none font-mono shadow-none hover:bg-[#eee] dark:hover:bg-[#333]",
        link: "text-blue-700 dark:text-blue-300 font-mono underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-100",

        //
        retro: cn(
          "bg-neutral-100 dark:bg-neutral-800",
          "text-black dark:text-white",
          "border-2 border-neutral-800 dark:border-neutral-200",
          "rounded-none font-mono text-sm uppercase tracking-wide",
          "shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_#aaa]",
          "hover:bg-neutral-200 dark:hover:bg-neutral-700",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-600 dark:focus-visible:ring-neutral-300",
          "transition-all"
        ),
        tabRetro: "flex-1 p-3 font-mono font-bold text-sm rounded-none! border-r border-neutral-800 dark:border-neutral-200 transition-colors aria-[selected=true]:bg-white aria-[selected=true]:dark:bg-neutral-800 aria-[selected=true]:text-neutral-900 aria-[selected=true]:dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 uppercase",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-5 px-2.5 has-[>svg]:px-2",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

