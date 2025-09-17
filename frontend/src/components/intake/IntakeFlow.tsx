import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../shared/Button'
import { Card, CardContent } from '../ui/Card'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react'
import { intakeService, IntakeData } from '../../services/intakeService'
import { Stage1LocationRole } from './stages/Stage1LocationRole'
import { Stage2Identity } from './stages/Stage2Identity'
import { Stage3Household } from './stages/Stage3Household'
import { Stage4Education } from './stages/Stage4Education'
import { Stage5Language } from './stages/Stage5Language'
import { Stage6Work } from './stages/Stage6Work'
import { Stage7JobOffer } from './stages/Stage7JobOffer'
import { Stage8StatusCanada } from './stages/Stage8StatusCanada'
import { Stage9Funds } from './stages/Stage9Funds'
import { Stage10History } from './stages/Stage10History'
import { Stage11Interest } from './stages/Stage11Interest'
import { Stage12Timeline } from './stages/Stage12Timeline'
import { useScrollToTop } from '../ui/ScrollToTop'
import { ProgressDialog } from './ProgressDialog'

export function IntakeFlow() {
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(window.location.search)
  const isReviewMode = searchParams.get('review') === 'true'
  const [intake, setIntake] = useState<IntakeData | null>(null)
  const [currentStage, setCurrentStage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showProgressDialog, setShowProgressDialog] = useState(false)

  // Stage data for current stage
  const [stageData, setStageData] = useState<Record<string, any>>({})
  
  // Debouncing and rate limiting
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSaveTime = useRef<number>(0)
  
  // Scroll to top when stage changes
  useScrollToTop(currentStage)

  // Memoized calculations (must be before early returns)
  const stageInfo = useMemo(() => {
    return intakeService.getStageInfo(currentStage)
  }, [currentStage])
  
  // Calculate completed stages count reactively (independent calculation)
  const completedStagesCount = useMemo(() => {
    if (!intake?.completed_stages || !Array.isArray(intake.completed_stages)) return 0
    // Use Array.from instead of spread operator for better TypeScript compatibility
    const uniqueStages = Array.from(new Set(intake.completed_stages))
    return uniqueStages.length
  }, [intake?.completed_stages])
  
  // Calculate completion percentage based on completed stages count
  const completionPercentage = useMemo(() => {
    const percentage = (completedStagesCount / 12) * 100
    const finalPercentage = Math.min(Math.max(percentage, 0), 100)
    
    return finalPercentage
  }, [completedStagesCount])
  
  // Check if intake is fully completed
  const isFullyCompleted = useMemo(() => {
    return completedStagesCount >= 12 || intake?.status === 'completed'
  }, [completedStagesCount, intake?.status])

  useEffect(() => {
    loadIntake()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Auto-detect timezone for Stage 2
    if (currentStage === 2 && !stageData.timezone) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setStageData(prev => ({ ...prev, timezone }))
    }
  }, [currentStage, stageData.timezone])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])
  

  // Auto-redirect when intake is fully completed (but not in review mode)
  useEffect(() => {
    if (isFullyCompleted && !loading && !isReviewMode) {
      // Clear any existing errors
      setError(null)
      
      // Show completion message briefly, then redirect
      const redirectTimer = setTimeout(() => {
        navigate('/client-dashboard')
      }, 3000) // 3 second delay to show completion message
      
      return () => clearTimeout(redirectTimer)
    }
  }, [isFullyCompleted, loading, navigate, isReviewMode])

  const loadIntake = async () => {
    try {
      setLoading(true)
      const intakeData = await intakeService.getMyIntake()
      setIntake(intakeData)
      
      // In review mode, start from stage 1, otherwise go to next incomplete stage
      if (isReviewMode) {
        setCurrentStage(1) // Start from stage 1 for review
      } else {
        const nextIncomplete = intakeService.getNextIncompleteStage(intakeData)
        setCurrentStage(nextIncomplete || intakeData.current_stage)
      }
      
      // Pre-fill stage data with existing intake data
      populateStageData(intakeData)
    } catch (err: any) {
      setError(err.message || 'Failed to load intake data')
    } finally {
      setLoading(false)
    }
  }

  const populateStageData = (intakeData: IntakeData) => {
    // Populate form fields with existing data
    const data: Record<string, any> = {}
    
    // Map all intake fields to stage data
    Object.keys(intakeData).forEach(key => {
      const value = (intakeData as any)[key]
      if (value !== null && value !== undefined && key !== 'id' && key !== 'client_id') {
        data[key] = value
      }
    })
    
    setStageData(data)
  }

  const saveStageData = async () => {
    if (!intake) return

    // Check rate limiting (minimum 2 seconds between saves)
    const now = Date.now()
    const timeSinceLastSave = now - lastSaveTime.current
    if (timeSinceLastSave < 2000) {
      console.log('Rate limiting: skipping save, too soon')
      return
    }

    try {
      setSaving(true)
      setError(null)
      lastSaveTime.current = now

      // Filter data relevant to current stage
      const relevantData = getRelevantStageData(currentStage, stageData)
      
      // Validate data
      const validation = intakeService.validateStageData(currentStage, relevantData)
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '))
      }

      // Update intake data
      const updatedIntake = await intakeService.updateIntakeStage({
        stage: currentStage,
        data: relevantData
      })

      setIntake(updatedIntake)
    } catch (err: any) {
      // Handle rate limiting specifically
      if (err.status === 429 || err.message?.includes('429') || err.message?.includes('Too many requests')) {
        setError('Please wait a moment before making changes. The system is preventing too many rapid updates.')
        // Wait 5 seconds before allowing another save
        lastSaveTime.current = now + 5000
      } else {
        // Only show error if it's not a rate limit skip
        if (!err.message?.includes('Rate limiting: skipping save')) {
          setError(err.message || 'Failed to save stage data')
        }
      }
      
      // Only throw error for actual API failures, not rate limiting
      if (err.status !== 429) {
        throw err
      }
    } finally {
      setSaving(false)
    }
  }

  // Debounced auto-save
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveStageData().catch(() => {
        // Auto-save errors are handled in saveStageData
      })
    }, 3000) // Auto-save after 3 seconds of no changes
  }, [saveStageData])

  const handleStageDataChange = (newData: Record<string, any>) => {
    setStageData(prev => ({ ...prev, ...newData }))
    // Trigger debounced auto-save (but not in review mode)
    if (!isReviewMode) {
      debouncedSave()
    }
  }

  const completeStage = async (forceComplete = false) => {
    if (!intake) return

    try {
      setSaving(true)
      setError(null)
      
      // For force complete or if validation passes, save data first
      if (forceComplete || canProceedToNext()) {
        try {
          await saveStageData()
        } catch (saveError) {
          console.warn('Save error during completion:', saveError)
          // Continue with completion even if save fails in force mode
          if (!forceComplete) {
            throw saveError
          }
        }
      }
      
      // Mark stage as completed
      const updatedIntake = await intakeService.completeStage({
        stage: currentStage
      })

      // Ensure completed_stages is properly updated
      if (updatedIntake && updatedIntake.completed_stages) {
        // Force update to ensure progress bar updates
        setIntake({ ...updatedIntake })
      } else {
        // Fallback: manually update completed_stages if backend doesn't return it properly
        const currentCompleted = intake.completed_stages || []
        const newCompleted = currentCompleted.includes(currentStage) 
          ? currentCompleted 
          : [...currentCompleted, currentStage]
        
        setIntake({
          ...updatedIntake,
          completed_stages: newCompleted
        })
      }
      
      // Move to next stage or completion
      if (currentStage < 12) {
        const nextStage = getNextRequiredStage(updatedIntake, currentStage)
        setCurrentStage(nextStage)
      }
      
      // Small delay to ensure state updates are processed
      setTimeout(() => {
        // Force re-render by updating a dummy state if needed
        setStageData(prev => ({ ...prev }))
      }, 100)
      
    } catch (err: any) {
      setError(err.message || 'Failed to complete stage')
    } finally {
      setSaving(false)
    }
  }

  const getNextRequiredStage = (intakeData: IntakeData, fromStage: number): number => {
    for (let stage = fromStage + 1; stage <= 12; stage++) {
      if (intakeService.isStageRequired(stage, intakeData)) {
        return stage
      }
    }
    return 12 // All stages completed
  }

  const getRelevantStageData = (stage: number, data: Record<string, any>): Record<string, any> => {
    const stageFieldMappings: Record<number, string[]> = {
      1: ['location', 'client_role'],
      2: ['full_name', 'email', 'phone', 'preferred_language', 'preferred_language_other', 'timezone', 'consent_acknowledgement'],
      3: ['marital_status', 'has_dependants', 'dependants_count', 'dependants_accompanying'],
      4: ['highest_education', 'eca_status', 'eca_provider', 'eca_result'],
      5: ['language_test_taken', 'test_type', 'test_date', 'language_scores'],
      6: ['years_experience', 'noc_codes', 'teer_level', 'regulated_occupation', 'work_country'],
      7: ['job_offer_status', 'employer_name', 'job_location', 'wage_offer', 'lmia_status'],
      8: ['current_status', 'status_expiry', 'province_residing'],
      9: ['proof_of_funds', 'family_ties', 'relationship_type'],
      10: ['prior_applications', 'application_outcomes', 'inadmissibility_flags'],
      11: ['program_interest', 'province_interest'],
      12: ['urgency', 'target_arrival', 'docs_ready']
    }

    const relevantFields = stageFieldMappings[stage] || []
    const filteredData: Record<string, any> = {}

    relevantFields.forEach(field => {
      if (data[field] !== undefined) {
        filteredData[field] = data[field]
      }
    })

    return filteredData
  }

  const handlePrevious = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1)
    }
  }

  const handleNext = async () => {
    try {
      await saveStageData()
      if (currentStage < 12) {
        setCurrentStage(currentStage + 1)
      }
    } catch (err) {
      // Error is already handled in saveStageData
    }
  }

  const canProceedToNext = (): boolean => {
    if (!intake) return false
    
    // Check if current stage data is valid
    const relevantData = getRelevantStageData(currentStage, stageData)
    const validation = intakeService.validateStageData(currentStage, relevantData)
    
    
    return validation.valid
  }

  const isStageCompleted = (stage: number): boolean => {
    return intake?.completed_stages?.includes(stage) || false
  }




  const renderStageComponent = () => {
    const stageProps = {
      data: stageData,
      onChange: handleStageDataChange,
      intake: intake!,
      onSave: saveStageData,
      saving
    }

    switch (currentStage) {
      case 1: return <Stage1LocationRole {...stageProps} />
      case 2: return <Stage2Identity {...stageProps} />
      case 3: return <Stage3Household {...stageProps} />
      case 4: return <Stage4Education {...stageProps} />
      case 5: return <Stage5Language {...stageProps} />
      case 6: return <Stage6Work {...stageProps} />
      case 7: return <Stage7JobOffer {...stageProps} />
      case 8: return <Stage8StatusCanada {...stageProps} />
      case 9: return <Stage9Funds {...stageProps} />
      case 10: return <Stage10History {...stageProps} />
      case 11: return <Stage11Interest {...stageProps} />
      case 12: return <Stage12Timeline {...stageProps} />
      default: return <div>Invalid stage</div>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your intake...</p>
        </div>
      </div>
    )
  }

  if (!intake) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Intake</h2>
            <p className="text-gray-600 mb-4">{error || 'There was an error loading your intake data.'}</p>
            <Button onClick={() => navigate('/client-dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Memoized calculations are now at the top of the component

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Header */}
      <div className="relative bg-white/95 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-6">
              <Button 
                variant="outline"
                onClick={() => navigate('/client-dashboard')}
                className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-gray-300 text-gray-700 hover:bg-white/90"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {isReviewMode ? 'Review Your Intake' : isFullyCompleted ? 'Intake Completed!' : 'Complete Your Intake'}
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  {isReviewMode 
                    ? 'Review your completed intake information 📋'
                    : isFullyCompleted 
                    ? '12 of 12 stages complete • 100% Complete 🎉'
                    : `Stage ${currentStage} of 12 • ${Math.round(completionPercentage)}% Complete`
                  }
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => setShowProgressDialog(true)}
                className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-gray-300 text-gray-700 hover:bg-white/90"
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Progress</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {stageInfo.title}
            </h2>
            <span className="text-sm text-gray-500">
              {isFullyCompleted ? '12 of 12 completed' : `${completedStagesCount} of 12 completed`}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4">{stageInfo.description}</p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isFullyCompleted 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}
              style={{ width: `${isFullyCompleted ? 100 : completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stage content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {renderStageComponent()}

          {/* Navigation */}
          <Card className="bg-white/95 backdrop-blur-xl border border-white/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStage === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-4">
                  {isStageCompleted(currentStage) && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Stage Completed
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleNext}
                      disabled={currentStage === 12}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    
                    {!isReviewMode && (
                      <Button
                        onClick={() => completeStage()}
                        disabled={!canProceedToNext() || saving}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        title={!canProceedToNext() ? 'Please fill in all required fields' : 'Complete this stage'}
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Completing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            {currentStage === 12 ? 'Complete Intake' : 'Complete Stage'}
                          </>
                        )}
                      </Button>
                    )}
                    
                    {/* Show validation errors for debugging */}
                    {!isReviewMode && currentStage === 12 && !canProceedToNext() && (
                      <div className="text-xs text-red-600 mt-1 space-y-1">
                        <div>Missing: {(() => {
                          const relevantData = getRelevantStageData(currentStage, stageData)
                          const validation = intakeService.validateStageData(currentStage, relevantData)
                          return validation.errors.join(', ')
                        })()}</div>
                        
                        {/* Force complete option for Stage 12 */}
                        <Button
                          onClick={() => {
                            // Force complete by bypassing validation
                            completeStage(true)
                          }}
                          disabled={saving}
                          variant="outline"
                          className="text-xs h-6 px-2 py-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          Force Complete Anyway
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Simple completion section for Stage 12 */}
          {!isReviewMode && currentStage === 12 && !isFullyCompleted && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900">Ready to Complete?</h4>
                    <p className="text-sm text-blue-700">
                      {stageData.urgency ? 
                        'You\'ve selected your timeline. Click to finish your intake!' : 
                        'Please select your timeline urgency above first.'}
                    </p>
                  </div>
                  <Button
                    onClick={() => completeStage(true)}
                    disabled={saving || !stageData.urgency}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? 'Completing...' : 'Finish Intake'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion message */}
          {isFullyCompleted && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  🎉 Intake Completed!
                </h3>
                <p className="text-green-700 mb-4">
                  Congratulations! You've completed all 12 stages of the intake process. This information will help your RCIC provide the best possible guidance for your immigration journey.
                </p>
                <div className="bg-green-100 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 font-medium mb-2">Next Steps:</p>
                  <p className="text-sm text-green-700">Your RCIC will review your intake and prepare a personalized consultation strategy. You'll be contacted within 24-48 hours to schedule your consultation.</p>
                </div>
                {!isReviewMode && (
                  <p className="text-sm text-green-600 mb-4">
                    Redirecting to dashboard in 3 seconds...
                  </p>
                )}
                <Button onClick={() => navigate('/client-dashboard')}>
                  Go to Dashboard Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Progress Dialog */}
      <ProgressDialog
        isOpen={showProgressDialog}
        onClose={() => setShowProgressDialog(false)}
        intake={intake}
        onNavigateToStage={(stage) => setCurrentStage(stage)}
        currentStage={currentStage}
      />
    </div>
  )
}
