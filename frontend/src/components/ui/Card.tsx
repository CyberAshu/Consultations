import React from 'react'
import { cn } from '../../utils/tailwind-utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
        className
      )}
      {...props}
    />
  )
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}
    />
  )
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children || ' '}
    </h3>
  )
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

// Blur Card Variants
export function BlurCard({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white/95 backdrop-blur-md border border-white/30 shadow-xl text-gray-900 transition-all duration-200",
        className
      )}
      {...props}
    />
  )
}

export function BlurCardDark({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gray-800/95 backdrop-blur-md border border-gray-700/50 shadow-xl text-gray-100 transition-all duration-200",
        className
      )}
      {...props}
    />
  )
}

export function GlassCard({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl text-white transition-all duration-200",
        className
      )}
      {...props}
    />
  )
}
