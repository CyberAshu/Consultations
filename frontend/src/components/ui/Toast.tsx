import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, X, Clock, Calendar } from 'lucide-react'

export interface ToastMessage {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastProps extends ToastMessage {
  onClose: (id: string) => void
}

function Toast({ id, type, title, message, duration = 5000, action, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Slide in animation
    setIsVisible(true)

    // Auto dismiss
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 300) // Wait for slide-out animation
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-50 text-green-900'
      case 'error':
        return 'border-red-500 bg-red-50 text-red-900'
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-900'
      case 'info':
      default:
        return 'border-blue-500 bg-blue-50 text-blue-900'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'info':
      default:
        return <Clock className="h-5 w-5 text-blue-600" />
    }
  }

  return (
    <div
      className={`
        fixed right-4 z-50 w-80 max-w-sm rounded-lg border-l-4 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out
        ${getTypeStyles()}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{
        top: `${Math.max(80, window.innerHeight * 0.1)}px`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-sm opacity-90 mt-1">{message}</p>
          
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemoveToast: (id: string) => void
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute top-0 right-0 space-y-2 p-4">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              transform: `translateY(${index * (80 + 8)}px)`, // 80px toast height + 8px gap
            }}
            className="pointer-events-auto"
          >
            <Toast {...toast} onClose={onRemoveToast} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Hook to manage toasts
export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15)
    setToasts(prev => [...prev, { ...toast, id }])
    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearToasts = () => {
    setToasts([])
  }

  // Helper methods for common toast types
  const success = (title: string, message: string, options?: Partial<ToastMessage>) => {
    return addToast({ type: 'success', title, message, ...options })
  }

  const error = (title: string, message: string, options?: Partial<ToastMessage>) => {
    return addToast({ type: 'error', title, message, duration: 7000, ...options })
  }

  const info = (title: string, message: string, options?: Partial<ToastMessage>) => {
    return addToast({ type: 'info', title, message, ...options })
  }

  const warning = (title: string, message: string, options?: Partial<ToastMessage>) => {
    return addToast({ type: 'warning', title, message, duration: 6000, ...options })
  }

  // Booking status specific toasts
  const bookingStatusUpdate = (bookingId: number, oldStatus: string, newStatus: string) => {
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'confirmed': return '✅'
        case 'completed': return '🎉'
        case 'cancelled': return '❌'
        case 'delayed': return '⏰'
        case 'rescheduled': return '📅'
        default: return '📝'
      }
    }

    const getStatusMessage = (status: string) => {
      switch (status) {
        case 'confirmed': return 'Your booking has been confirmed!'
        case 'completed': return 'Your session has been completed.'
        case 'cancelled': return 'Your booking has been cancelled.'
        case 'delayed': return 'Your session has been delayed.'
        case 'rescheduled': return 'Your session has been rescheduled.'
        default: return `Status updated to ${status}`
      }
    }

    const type = newStatus === 'cancelled' ? 'error' : 
                newStatus === 'completed' ? 'success' : 'info'

    return addToast({
      type,
      title: `${getStatusIcon(newStatus)} Booking #${bookingId} Updated`,
      message: getStatusMessage(newStatus),
      action: {
        label: 'View Details',
        onClick: () => {
          // Navigate to booking details or refresh the page
          window.location.reload()
        }
      }
    })
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    info,
    warning,
    bookingStatusUpdate
  }
}
