import { useState, useEffect } from 'react'
import { intakeService, IntakeData, IntakeSummary } from '../../../api/services/intake.service'

export function useIntake() {
  const [intake, setIntake] = useState<IntakeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadIntake = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await intakeService.getMyIntake()
      setIntake(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load intake')
    } finally {
      setLoading(false)
    }
  }

  const updateStage = async (stage: number, stageData: Record<string, any>) => {
    try {
      const updated = await intakeService.updateIntakeStage({
        stage,
        data: stageData
      })
      setIntake(updated)
      return updated
    } catch (err: any) {
      setError(err.message || 'Failed to update intake')
      throw err
    }
  }

  const completeStage = async (stage: number) => {
    try {
      const updated = await intakeService.completeStage({ stage })
      setIntake(updated)
      return updated
    } catch (err: any) {
      setError(err.message || 'Failed to complete stage')
      throw err
    }
  }

  useEffect(() => {
    loadIntake()
  }, [])

  return {
    intake,
    loading,
    error,
    loadIntake,
    updateStage,
    completeStage,
    isStageComplete: (stage: number) => intake?.completed_stages?.includes(stage) || false,
    getCompletionPercentage: () => intakeService.getStageCompletionPercentage(intake!),
    getNextIncompleteStage: () => intakeService.getNextIncompleteStage(intake!)
  }
}

export function useIntakeSummary() {
  const [summary, setSummary] = useState<IntakeSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSummary = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await intakeService.getMyIntakeSummary()
      setSummary(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load intake summary')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSummary()
  }, [])

  return {
    summary,
    loading,
    error,
    loadSummary
  }
}
