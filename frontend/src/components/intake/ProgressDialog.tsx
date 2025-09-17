import React from 'react'
import { Button } from '../shared/Button'
import { Card, CardContent } from '../ui/Card'
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Clock,
  X
} from 'lucide-react'
import { intakeService } from '../../services/intakeService'

interface ProgressDialogProps {
  isOpen: boolean
  onClose: () => void
  intake: any
  onNavigateToStage: (stage: number) => void
  currentStage: number
}

export function ProgressDialog({ isOpen, onClose, intake, onNavigateToStage, currentStage }: ProgressDialogProps) {
  if (!isOpen) return null

  const getStageStatus = (stage: number) => {
    const isCompleted = intake?.completed_stages?.includes(stage) || false
    const isCurrent = currentStage === stage
    const isVisited = stage <= (intake?.current_stage || 1)
    
    return {
      isCompleted,
      isCurrent,
      isVisited,
      canNavigate: isVisited
    }
  }

  const getProgressPercentage = () => {
    if (!intake?.completed_stages) return 0
    return Math.round((intake.completed_stages.length / 12) * 100)
  }

  const getLastVisitedStage = () => {
    return intake?.current_stage || 1
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog content */}
      <div className="relative z-50 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="bg-white">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Your Intake Progress
              </h2>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Summary */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
                    <p className="text-sm text-gray-600">
                      Last visited: Stage {getLastVisitedStage()} • {getProgressPercentage()}% completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {intake?.completed_stages?.length || 0}/12
                    </div>
                    <div className="text-xs text-gray-500">stages complete</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Resume */}
            <div className="flex gap-3 items-center p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <Clock className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-900">Quick Resume</p>
                <p className="text-sm text-amber-700">
                  Continue from Stage {getLastVisitedStage()}: {intakeService.getStageInfo(getLastVisitedStage()).title}
                </p>
              </div>
              <Button
                onClick={() => {
                  onNavigateToStage(getLastVisitedStage())
                  onClose()
                }}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Resume <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Stage Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 12 }, (_, i) => {
                const stage = i + 1
                const stageInfo = intakeService.getStageInfo(stage)
                const status = getStageStatus(stage)
                
                return (
                  <div 
                    key={stage}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      status.isCompleted 
                        ? 'bg-green-50 border-green-300 text-green-800' 
                        : status.isCurrent 
                        ? 'bg-blue-50 border-blue-300 text-blue-800'
                        : status.isVisited 
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                        : 'bg-gray-50 border-gray-300 text-gray-500 opacity-60'
                    } ${
                      !status.canNavigate ? 'cursor-not-allowed' : ''
                    }`}
                    onClick={() => {
                      if (status.canNavigate) {
                        onNavigateToStage(stage)
                        onClose()
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {status.isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : status.isCurrent ? (
                        <Circle className="h-4 w-4 text-blue-600 fill-blue-600" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      <span className="font-medium text-sm">Stage {stage}</span>
                    </div>
                    
                    <h4 className="font-semibold text-sm mb-1">{stageInfo.title}</h4>
                    <p className="text-xs opacity-90">{stageInfo.description}</p>
                    
                    <div className="mt-2 text-xs">
                      {status.isCompleted ? (
                        <span className="text-green-600 font-medium">✓ Complete</span>
                      ) : status.isCurrent ? (
                        <span className="text-blue-600 font-medium">● Current</span>
                      ) : status.isVisited ? (
                        <span className="text-yellow-600 font-medium">◐ Visited</span>
                      ) : (
                        <span className="text-gray-400">○ Not Started</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={() => {
                  onNavigateToStage(getLastVisitedStage())
                  onClose()
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue from Stage {getLastVisitedStage()}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}