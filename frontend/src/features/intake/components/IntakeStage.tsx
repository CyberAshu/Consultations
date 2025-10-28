import { IntakeData } from '../../../api/services/intake.service'

export interface IntakeStageProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  intake: IntakeData
  onSave: () => Promise<void>
  saving: boolean
}

export interface IntakeStage {
  // Base interface for all intake stages
}