import { cn } from './tailwind-utils'

// Blur theme utility functions
export const blurTheme = {
  // Card variants
  card: (variant: 'default' | 'blur' | 'glass' | 'dark' = 'default') => {
    const variants = {
      default: "bg-white border border-gray-200 shadow-sm",
      blur: "bg-white/95 backdrop-blur-md border border-white/30 shadow-xl",
      glass: "bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl",
      dark: "bg-gray-800/95 backdrop-blur-md border border-gray-700/50 shadow-xl"
    }
    return variants[variant]
  },

  // Text variants
  text: (variant: 'primary' | 'secondary' | 'muted' | 'accent' = 'primary', blur: boolean = false) => {
    if (!blur) {
      const variants = {
        primary: "text-gray-900",
        secondary: "text-gray-700",
        muted: "text-gray-500",
        accent: "text-blue-600"
      }
      return variants[variant]
    }
    
    const blurVariants = {
      primary: "text-white text-shadow-sm",
      secondary: "text-gray-100 text-shadow-sm",
      muted: "text-gray-300 text-shadow-sm",
      accent: "text-blue-400 text-shadow-sm"
    }
    return blurVariants[variant]
  },

  // Button variants
  button: (variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary', blur: boolean = false) => {
    if (!blur) {
      const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-900",
        ghost: "hover:bg-gray-100 text-gray-900"
      }
      return variants[variant]
    }
    
    const blurVariants = {
      primary: "bg-blue-600/90 hover:bg-blue-700/90 text-white backdrop-blur-sm border border-blue-500/30 shadow-lg",
      secondary: "bg-white/90 hover:bg-white/95 text-gray-900 backdrop-blur-sm border border-white/30 shadow-lg",
      outline: "bg-transparent hover:bg-white/20 text-white backdrop-blur-sm border-2 border-white/50 hover:border-white/70 shadow-lg text-shadow-sm",
      ghost: "hover:bg-white/20 text-white backdrop-blur-sm text-shadow-sm"
    }
    return blurVariants[variant]
  },

  // Background variants
  background: (variant: 'default' | 'overlay' | 'gradient' = 'default', blur: boolean = false) => {
    if (!blur) {
      const variants = {
        default: "bg-white",
        overlay: "bg-gray-50",
        gradient: "bg-gradient-to-br from-blue-50 to-indigo-100"
      }
      return variants[variant]
    }
    
    const blurVariants = {
      default: "bg-gray-900/50 backdrop-blur-sm",
      overlay: "bg-black/30 backdrop-blur-sm",
      gradient: "bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-sm"
    }
    return blurVariants[variant]
  }
}

// Helper function to conditionally apply blur theme classes
export const withBlurTheme = (baseClasses: string, blurClasses: string, isBlur: boolean = false) => {
  return cn(baseClasses, isBlur ? blurClasses : "")
}

// Context for managing blur theme state
export const createBlurThemeContext = () => {
  const getThemeClasses = (component: string, variant: string = 'default', isBlur: boolean = false) => {
    switch (component) {
      case 'card':
        return blurTheme.card(variant as any)
      case 'text':
        return blurTheme.text(variant as any, isBlur)
      case 'button':
        return blurTheme.button(variant as any, isBlur)
      case 'background':
        return blurTheme.background(variant as any, isBlur)
      default:
        return ''
    }
  }
  
  return { getThemeClasses }
}
