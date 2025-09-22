import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../shared/Button'
import { intakeService } from '../../services/intakeService'
import {
  Move,
  Minimize2,
  X,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Circle
} from 'lucide-react'

interface FloatingIntakeProgressProps {
  intake: any
  currentStage: number
  isVisible: boolean
  onClose: () => void
  onNavigateToStage: (stage: number) => void
}

export function FloatingIntakeProgress({
  intake,
  currentStage,
  isVisible,
  onClose,
  onNavigateToStage
}: FloatingIntakeProgressProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isExpanded, setIsExpanded] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const completedStagesCount = useMemo(() => {
    if (!intake?.completed_stages || !Array.isArray(intake.completed_stages)) return 0
    return Array.from(new Set(intake.completed_stages)).length
  }, [intake?.completed_stages])

  const percentage = useMemo(() => {
    const pct = Math.min(Math.max((completedStagesCount / 12) * 100, 0), 100)
    return Math.round(pct)
  }, [completedStagesCount])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
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

  const handleMouseUp = () => setIsDragging(false)

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
        setPosition({ x: 10, y: window.innerHeight - (isMinimized ? 80 : 420) })
      } else {
        setPosition({ x: 20, y: 20 })
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [isMinimized])

  if (!isVisible) return null

  const MinimizedView = () => (
    <div
      ref={containerRef}
      className="fixed z-50 transition-all duration-300 ease-in-out"
      style={{ left: position.x, top: position.y, cursor: isDragging ? 'grabbing' : 'grab' }}
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
            <span className="text-[10px] font-medium text-blue-600">Intake</span>
            <span className="text-xs font-semibold text-blue-700">{percentage}%</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  if (isMinimized) return <MinimizedView />

  const StageRow = ({ stage }: { stage: number }) => {
    const info = intakeService.getStageInfo(stage)
    const isCompleted = intake?.completed_stages?.includes(stage)
    const isCurrent = currentStage === stage
    const isVisited = stage <= (intake?.current_stage || 1)

    return (
      <div
        className={`p-2 rounded-md border cursor-pointer transition-all text-xs sm:text-sm ${
          isCompleted
            ? 'bg-green-50 border-green-300 text-green-800'
            : isCurrent
            ? 'bg-blue-50 border-blue-300 text-blue-800'
            : isVisited
            ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
            : 'bg-gray-50 border-gray-300 text-gray-600 opacity-80'
        } ${!isVisited ? 'cursor-not-allowed' : ''}`}
        onClick={() => {
          if (isVisited) onNavigateToStage(stage)
        }}
      >
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
          ) : isCurrent ? (
            <Circle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 fill-blue-600" />
          ) : (
            <Circle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium">Stage {stage}: {info.title}</div>
            <div className="truncate text-[11px] sm:text-xs opacity-80">{info.description}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-50 transition-all duration-300 ease-in-out"
      style={{ left: position.x, top: position.y, cursor: isDragging ? 'grabbing' : 'auto' }}
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
              <h3 className="font-semibold text-sm">Intake Progress</h3>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-xs font-semibold mr-2">{completedStagesCount}/12 ({percentage}%)</div>
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
          {/* Summary Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Current Stage Highlight */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-sm font-semibold text-blue-900 mb-1">
              Current: Stage {currentStage}
            </div>
            <div className="text-xs text-blue-800">
              {intakeService.getStageInfo(currentStage).title}
            </div>
          </div>

          {/* Stage List */}
          {isExpanded && (
            <div className="space-y-2">
              {Array.from({ length: 12 }, (_, i) => (
                <StageRow key={i} stage={i + 1} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
