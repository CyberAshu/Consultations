import React, { useState, useEffect } from 'react'
import { Button } from './Button'
import { ArrowUp } from 'lucide-react'

interface ScrollToTopProps {
  threshold?: number
  smooth?: boolean
  className?: string
}

export function ScrollToTop({ 
  threshold = 300, 
  smooth = true, 
  className = '' 
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [threshold])

  const scrollToTop = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } else {
      window.scrollTo(0, 0)
    }
  }

  if (!isVisible) return null

  return (
    <Button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${className}`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5 group-hover:transform group-hover:-translate-y-0.5 transition-transform duration-200" />
    </Button>
  )
}

// Hook for automatic scroll to top on route change
export function useScrollToTop(trigger?: any) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [trigger])
}

// Component that automatically scrolls to top when mounted
export function AutoScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  
  return null
}
