import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../shared/Button'
import { 
  Clock, 
  User, 
  MapPin, 
  Shield, 
  Minimize2, 
  Maximize2, 
  X,
  Receipt,
  Calendar,
  DollarSign,
  Move,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

interface FloatingBookingSummaryProps {
  bookingData: any
  currentStep: number
  isVisible: boolean
  onClose: () => void
}

export function FloatingBookingSummary({ 
  bookingData, 
  currentStep, 
  isVisible, 
  onClose 
}: FloatingBookingSummaryProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 320, e.clientX - dragOffset.x))
      const newY = Math.max(0, Math.min(window.innerHeight - 400, e.clientY - dragOffset.y))
      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  // Auto-position for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPosition({ x: 10, y: window.innerHeight - (isMinimized ? 80 : 400) })
      } else {
        setPosition({ x: 20, y: 20 })
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [isMinimized])

  if (!isVisible || currentStep === 1 || currentStep === 5) return null

  const MinimizedView = () => (
    <div 
      ref={containerRef}
      className="fixed z-50 transition-all duration-300 ease-in-out"
      style={{ 
        left: position.x, 
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <Card className="bg-white/95 backdrop-blur-xl shadow-xl border-2 border-blue-200/50 hover:shadow-2xl transition-all duration-200 w-16 h-16">
        <CardContent className="p-2 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setIsMinimized(false)
            }}
            className="w-full h-full flex flex-col items-center justify-center gap-1 hover:bg-blue-50"
          >
            <Receipt className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-600">
              ${bookingData.totalAmount || 0}
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  if (isMinimized) {
    return <MinimizedView />
  }

  return (
    <div 
      ref={containerRef}
      className="fixed z-50 transition-all duration-300 ease-in-out"
      style={{ 
        left: position.x, 
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
    >
      <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-2 border-blue-200/50 w-80 max-w-[calc(100vw-40px)] max-h-[calc(100vh-40px)] overflow-hidden">
        {/* Header with drag handle */}
        <div 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4" />
              <h3 className="font-semibold text-sm">Booking Summary</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* RCIC Info */}
          {bookingData.rcic && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {(bookingData.rcic?.name || '').split(' ').map((n: string) => n[0]).join('') || 'N/A'}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{bookingData.rcic?.name}</p>
                  <p className="text-xs text-gray-600">{bookingData.rcic?.rcic_number || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Service Info */}
          {bookingData.service && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{bookingData.service?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-600">{bookingData.service?.duration || 'N/A'}</p>
                </div>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  ${bookingData.service?.price || 0}
                </Badge>
              </div>
            </div>
          )}

          {/* Time Slot Info */}
          {bookingData.timeSlot && (
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">{bookingData.timeSlot?.date || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-700">{bookingData.timeSlot?.time || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-gray-600">{bookingData.timezone}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Status */}
          {bookingData.payment && (
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">Payment Confirmed</span>
              </div>
              <p className="text-xs text-emerald-700">ID: {bookingData.payment?.id || 'N/A'}</p>
            </div>
          )}

          {/* Expanded Details */}
          {isExpanded && (
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-2">Progress</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={currentStep >= 2 ? 'text-green-600' : 'text-gray-500'}>
                      ✓ Service Selected
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={currentStep >= 3 ? 'text-green-600' : 'text-gray-500'}>
                      {currentStep >= 3 ? '✓' : '○'} Time Scheduled
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={currentStep >= 4 ? 'text-green-600' : 'text-gray-500'}>
                      {currentStep >= 4 ? '✓' : '○'} Payment Complete
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={currentStep >= 5 ? 'text-green-600' : 'text-gray-500'}>
                      {currentStep >= 5 ? '✓' : '○'} Documents Uploaded
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total</span>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="font-bold text-blue-600 text-lg">${bookingData.totalAmount || 0}</span>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-900">Secure & Protected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
