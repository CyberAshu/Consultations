import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils/tailwind-utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50 hover:text-gray-900 shadow-sm hover:shadow-md",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm hover:shadow-md",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "underline-offset-4 hover:underline text-blue-600",
        // Blur theme variants
        'blur-primary': "bg-blue-600/90 hover:bg-blue-700/90 text-white backdrop-blur-sm border border-blue-500/30 shadow-lg hover:shadow-xl",
        'blur-secondary': "bg-white/90 hover:bg-white/95 text-gray-900 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl",
        'blur-outline': "bg-transparent hover:bg-white/20 text-white backdrop-blur-sm border-2 border-white/50 hover:border-white/70 shadow-lg hover:shadow-xl text-shadow-sm",
        'blur-ghost': "hover:bg-white/20 text-white backdrop-blur-sm text-shadow-sm",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
