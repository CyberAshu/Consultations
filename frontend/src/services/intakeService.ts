import { api } from './api'

// Types for intake data
export interface IntakeData {
  id: number
  client_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'updated'
  current_stage: number
  completed_stages: number[]
  
  // Stage data
  location?: 'inside_canada' | 'outside_canada' | 'not_sure'
  client_role?: 'principal_applicant' | 'sponsor' | 'spouse_partner' | 'dependent' | 'employer_hr_rep' | 'other'
  full_name?: string
  email?: string
  phone?: string
  preferred_language?: string
  preferred_language_other?: string
  timezone?: string
  consent_acknowledgement?: string[]
  
  marital_status?: 'single' | 'married' | 'common_law' | 'separated' | 'divorced' | 'widowed'
  has_dependants?: boolean
  dependants_count?: number
  dependants_accompanying?: string
  
  highest_education?: 'high_school' | 'one_year_diploma' | 'two_plus_year_diploma' | 'bachelors' | 'masters' | 'doctorate'
  eca_status?: 'yes' | 'in_progress' | 'no' | 'not_sure'
  eca_provider?: 'wes' | 'ces' | 'icas' | 'iqas' | 'mcc' | 'others' | 'not_applicable'
  eca_result?: string
  
  language_test_taken?: string
  test_type?: 'ielts' | 'celpip' | 'tef' | 'tcf'
  test_date?: string
  language_scores?: { listening: number; speaking: number; reading: number; writing: number }
  
  years_experience?: number
  noc_codes?: string[]
  teer_level?: 'teer_0' | 'teer_1' | 'teer_2' | 'teer_3' | 'not_sure'
  regulated_occupation?: string
  work_country?: string[]
  
  job_offer_status?: 'yes' | 'no' | 'interviewing' | 'not_sure'
  employer_name?: string
  job_location?: { province: string; city: string }
  wage_offer?: number
  lmia_status?: 'approved' | 'in_progress' | 'exempt' | 'not_applicable' | 'unknown'
  
  current_status?: 'visitor' | 'student' | 'worker' | 'pgwp' | 'trp' | 'refugee_claimant' | 'no_status' | 'other'
  status_expiry?: string
  province_residing?: string
  
  proof_of_funds?: 'under_5k' | 'five_to_10k' | 'ten_to_20k' | 'twenty_to_50k' | 'over_50k'
  family_ties?: boolean
  relationship_type?: string
  
  prior_applications?: boolean
  application_outcomes?: string[]
  inadmissibility_flags?: string[]
  
  program_interest?: string[]
  province_interest?: string[]
  
  urgency?: 'immediately' | 'one_to_three_months' | 'three_to_six_months' | 'flexible'
  target_arrival?: string
  docs_ready?: string[]
  uploaded_files?: Array<{
    id: string
    name: string
    size: number
    type: string
    uploadedAt: string
    file_path?: string
  }>
  
  created_at: string
  updated_at?: string
  completed_at?: string
  documents?: IntakeDocument[]
  
  // Additional fields for mock data
  completion_percentage?: number
  immigration_status_note?: string
  immigration_goal_note?: string
  specific_questions?: string
  previous_applications_summary?: string
  formatted_text?: string
}

export interface IntakeSummary {
  id: number
  client_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'updated'
  current_stage: number
  completed_stages: number[]
  completion_percentage: number
  created_at: string
  updated_at?: string
  completed_at?: string
}

export interface IntakeDocument {
  id: number
  file_name: string
  file_path: string
  file_size?: number
  file_type?: string
  stage?: number
  uploaded_at: string
}

export interface IntakeUpdateRequest {
  stage: number
  data: Record<string, any>
}

export interface IntakeCompleteStageRequest {
  stage: number
}

class IntakeService {
  // Get current user's intake data
  async getMyIntake(): Promise<IntakeData> {
    const response = await api.get<IntakeData>('/intake/me')
    return response
  }

  // Get client intake data (for RCICs)
  async getClientIntake(clientId: string): Promise<IntakeData> {
    const response = await api.get<IntakeData>(`/intake/client/${clientId}`)
    return response
  }

  // Get client intake summary (for RCICs)
  async getClientIntakeSummary(clientId: string): Promise<IntakeSummary> {
    const response = await api.get<IntakeSummary>(`/intake/client/${clientId}/summary`)
    return response
  }

  // Get intake summary
  async getMyIntakeSummary(): Promise<IntakeSummary> {
    const response = await api.get<IntakeSummary>('/intake/me/summary')
    return response
  }

  // Update intake data for a specific stage
  async updateIntakeStage(stageData: IntakeUpdateRequest): Promise<IntakeData> {
    const response = await api.post<IntakeData>('/intake/me/update', stageData)
    return response
  }

  // Mark a stage as completed
  async completeStage(stageData: IntakeCompleteStageRequest): Promise<IntakeData> {
    const response = await api.post<IntakeData>('/intake/me/complete-stage', stageData)
    return response
  }

  // Upload document for intake
  async uploadDocument(file: File, stage: number): Promise<IntakeDocument> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('stage', stage.toString())

    const response = await api.postFormData<IntakeDocument>('/intake/me/upload-document', formData)
    return response
  }

  // Get intake documents
  async getMyDocuments(stage?: number): Promise<IntakeDocument[]> {
    const params = stage ? { stage } : {}
    const response = await api.get<IntakeDocument[]>('/intake/me/documents', params)
    return response
  }

  // Delete intake document
  async deleteDocument(documentId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/intake/me/documents/${documentId}`)
    return response
  }

  // Helper methods for stage validation and navigation
  isStageComplete(intake: IntakeData, stage: number): boolean {
    return intake.completed_stages?.includes(stage) || false
  }

  getNextIncompleteStage(intake: IntakeData): number | null {
    for (let stage = 1; stage <= 12; stage++) {
      if (!this.isStageComplete(intake, stage)) {
        return stage
      }
    }
    return null
  }

  getStageCompletionPercentage(intake: IntakeData): number {
    if (!intake.completed_stages || !Array.isArray(intake.completed_stages)) return 0
    
    // Count unique completed stages using Array.from for better TypeScript compatibility
    const uniqueCompletedStages = Array.from(new Set(intake.completed_stages))
    
    // Calculate percentage based on total 12 stages
    const percentage = (uniqueCompletedStages.length / 12) * 100
    
    // Ensure percentage is between 0 and 100
    return Math.min(Math.max(percentage, 0), 100)
  }

  isStageRequired(stage: number, intake: IntakeData): boolean {
    // Stage 8 (Status in Canada) is only required for those inside Canada
    if (stage === 8) {
      return intake.location === 'inside_canada'
    }
    // Add other conditional logic as needed
    return true
  }

  // Get stage title and description
  getStageInfo(stage: number): { title: string; description: string } {
    const stageInfo: Record<number, { title: string; description: string }> = {
      1: { title: 'Location & Role', description: 'Where are you completing this form from?' },
      2: { title: 'Identity & Contact', description: 'Basic contact information and consent' },
      3: { title: 'Household', description: 'Family composition and dependents' },
      4: { title: 'Education', description: 'Educational background and assessments' },
      5: { title: 'Language Skills', description: 'Language test results and proficiency' },
      6: { title: 'Work History', description: 'Professional experience and background' },
      7: { title: 'Job Offer', description: 'Current job offers and LMIA status' },
      8: { title: 'Status in Canada', description: 'Current immigration status (if in Canada)' },
      9: { title: 'Funds & Ties', description: 'Financial resources and family connections' },
      10: { title: 'Application History', description: 'Previous applications and issues' },
      11: { title: 'Program Interest', description: 'Immigration programs and provinces of interest' },
      12: { title: 'Timeline & Documents', description: 'Timeline and document readiness' }
    }
    return stageInfo[stage] || { title: `Stage ${stage}`, description: '' }
  }

  // Validate stage data before submission
  validateStageData(stage: number, data: Record<string, any>): { valid: boolean; errors: string[] } {
    const validation = { valid: true, errors: [] as string[] }

    switch (stage) {
      case 1:
        if (!data.location) validation.errors.push('Location is required')
        if (!data.client_role) validation.errors.push('Client role is required')
        break
      
      case 2:
        if (!data.full_name) validation.errors.push('Full name is required')
        if (!data.email) validation.errors.push('Email is required')
        if (!data.preferred_language) validation.errors.push('Preferred language is required')
        if (!data.timezone) validation.errors.push('Timezone is required')
        if (!data.consent_acknowledgement || data.consent_acknowledgement.length < 3) {
          validation.errors.push('All consent items must be acknowledged')
        }
        break
        
      case 3:
        if (!data.marital_status) validation.errors.push('Marital status is required')
        if (data.has_dependants === undefined) validation.errors.push('Dependents question is required')
        if (data.has_dependants && !data.dependants_count) validation.errors.push('Number of dependents is required')
        break
        
      case 4:
        if (!data.highest_education) validation.errors.push('Highest education is required')
        break
        
      case 5:
        // Language skills stage - optional, but if test taken, validate accordingly
        if (data.language_test_taken === 'yes') {
          if (!data.test_type) validation.errors.push('Test type is required when language test was taken')
          if (!data.test_date) validation.errors.push('Test date is required when language test was taken')
        }
        break
        
      case 6:
        if (data.years_experience === undefined || data.years_experience === null) {
          validation.errors.push('Years of experience is required')
        }
        break
        
      case 7:
        // Job offer stage - validate based on job offer status
        if (data.job_offer_status === 'yes') {
          if (!data.employer_name) validation.errors.push('Employer name is required when you have a job offer')
          if (!data.job_location?.province) validation.errors.push('Job location (province) is required when you have a job offer')
        }
        break
        
      case 8:
        // Only validate if user is inside Canada (conditional stage)
        // This should be handled by the stage component itself
        break
        
      case 9:
        if (!data.proof_of_funds) validation.errors.push('Proof of funds is required')
        if (data.family_ties === undefined || data.family_ties === null) {
          validation.errors.push('Family ties question is required')
        }
        if (data.family_ties === true && !data.relationship_type) {
          validation.errors.push('Relationship type is required when you have family ties')
        }
        break
        
      case 10:
        if (data.prior_applications === undefined || data.prior_applications === null) {
          validation.errors.push('Prior applications question is required')
        }
        if (!data.inadmissibility_flags || data.inadmissibility_flags.length === 0) {
          validation.errors.push('Inadmissibility assessment is required')
        }
        break
        
      case 11:
        if (!data.program_interest || data.program_interest.length === 0) {
          validation.errors.push('At least one program interest is required')
        }
        break
        
      case 12:
        if (!data.urgency) validation.errors.push('Timeline urgency is required')
        break
    }

    validation.valid = validation.errors.length === 0
    return validation
  }

  // Get options for dropdowns and multi-selects
  getStageOptions() {
    return {
      location: [
        { value: 'inside_canada', label: 'Inside Canada' },
        { value: 'outside_canada', label: 'Outside Canada' },
        { value: 'not_sure', label: 'Not sure' }
      ],
      client_role: [
        { value: 'principal_applicant', label: 'Principal Applicant' },
        { value: 'sponsor', label: 'Sponsor' },
        { value: 'spouse_partner', label: 'Spouse/Partner' },
        { value: 'dependent', label: 'Dependent' },
        { value: 'employer_hr_rep', label: 'Employer/HR Representative' },
        { value: 'other', label: 'Other' }
      ],
      preferred_language: [
        { value: 'english', label: 'English' },
        { value: 'french', label: 'French' },
        { value: 'other', label: 'Other' }
      ],
      marital_status: [
        { value: 'single', label: 'Single' },
        { value: 'married', label: 'Married' },
        { value: 'common_law', label: 'Common-law' },
        { value: 'separated', label: 'Separated' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'widowed', label: 'Widowed' }
      ],
      highest_education: [
        { value: 'high_school', label: 'High school' },
        { value: 'one_year_diploma', label: '1-year diploma/certificate' },
        { value: 'two_plus_year_diploma', label: '2+ year diploma' },
        { value: 'bachelors', label: "Bachelor's degree" },
        { value: 'masters', label: "Master's degree" },
        { value: 'doctorate', label: 'Doctorate' }
      ],
      eca_status: [
        { value: 'yes', label: 'Yes' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'Not sure' }
      ],
      eca_provider: [
        { value: 'wes', label: 'WES' },
        { value: 'ces', label: 'CES' },
        { value: 'icas', label: 'ICAS' },
        { value: 'iqas', label: 'IQAS' },
        { value: 'mcc', label: 'MCC' },
        { value: 'others', label: 'Others' },
        { value: 'not_applicable', label: 'Not applicable' }
      ],
      program_interest: [
        { value: 'express_entry', label: 'Express Entry' },
        { value: 'family_sponsorship', label: 'Family Sponsorship' },
        { value: 'study', label: 'Study' },
        { value: 'work', label: 'Work' },
        { value: 'refugee_hc', label: 'Refugee/H&C' },
        { value: 'pnp', label: 'PNP' },
        { value: 'rnip', label: 'RNIP' },
        { value: 'aip', label: 'AIP' },
        { value: 'startup_visa', label: 'Startup Visa' },
        { value: 'iec', label: 'IEC' },
        { value: 'other', label: 'Other' },
        { value: 'not_sure', label: 'Not Sure' }
      ],
      provinces: [
        { value: 'alberta', label: 'Alberta' },
        { value: 'british_columbia', label: 'British Columbia' },
        { value: 'manitoba', label: 'Manitoba' },
        { value: 'new_brunswick', label: 'New Brunswick' },
        { value: 'newfoundland_labrador', label: 'Newfoundland and Labrador' },
        { value: 'northwest_territories', label: 'Northwest Territories' },
        { value: 'nova_scotia', label: 'Nova Scotia' },
        { value: 'nunavut', label: 'Nunavut' },
        { value: 'ontario', label: 'Ontario' },
        { value: 'prince_edward_island', label: 'Prince Edward Island' },
        { value: 'quebec', label: 'Quebec' },
        { value: 'saskatchewan', label: 'Saskatchewan' },
        { value: 'yukon', label: 'Yukon' },
        { value: 'not_sure', label: 'Not Sure' }
      ],
      urgency: [
        { value: 'immediately', label: 'Immediately' },
        { value: 'one_to_three_months', label: '1-3 months' },
        { value: 'three_to_six_months', label: '3-6 months' },
        { value: 'flexible', label: 'Flexible' }
      ],
      test_types: [
        { value: 'ielts', label: 'IELTS' },
        { value: 'celpip', label: 'CELPIP' },
        { value: 'tef', label: 'TEF' },
        { value: 'tcf', label: 'TCF' }
      ],
      teer_levels: [
        { value: 'teer_0', label: 'TEER 0' },
        { value: 'teer_1', label: 'TEER 1' },
        { value: 'teer_2', label: 'TEER 2' },
        { value: 'teer_3', label: 'TEER 3' },
        { value: 'not_sure', label: 'Not sure' }
      ],
      job_offer_status: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'interviewing', label: 'Interviewing' },
        { value: 'not_sure', label: 'Not sure' }
      ],
      lmia_status: [
        { value: 'approved', label: 'Approved' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'exempt', label: 'Exempt' },
        { value: 'not_applicable', label: 'Not applicable' },
        { value: 'unknown', label: 'Unknown' }
      ],
      canadian_status: [
        { value: 'visitor', label: 'Visitor' },
        { value: 'student', label: 'Student' },
        { value: 'worker', label: 'Worker' },
        { value: 'pgwp', label: 'PGWP' },
        { value: 'trp', label: 'TRP' },
        { value: 'refugee_claimant', label: 'Refugee Claimant' },
        { value: 'no_status', label: 'No Status' },
        { value: 'other', label: 'Other' }
      ],
      proof_of_funds: [
        { value: 'under_5k', label: 'Under $5,000' },
        { value: 'five_to_10k', label: '$5,000 - $10,000' },
        { value: 'ten_to_20k', label: '$10,000 - $20,000' },
        { value: 'twenty_to_50k', label: '$20,000 - $50,000' },
        { value: 'over_50k', label: 'Over $50,000' }
      ],
      relationship_types: [
        { value: 'parent', label: 'Parent' },
        { value: 'sibling', label: 'Sibling' },
        { value: 'spouse', label: 'Spouse' },
        { value: 'child', label: 'Child' },
        { value: 'uncle_aunt', label: 'Uncle/Aunt' },
        { value: 'cousin', label: 'Cousin' },
        { value: 'other', label: 'Other' }
      ],
      application_outcomes: [
        { value: 'refusal', label: 'Refusal' },
        { value: 'withdrawal', label: 'Withdrawal' },
        { value: 'appeal', label: 'Appeal' },
        { value: 'removal_order', label: 'Removal Order' },
        { value: 'none', label: 'None' }
      ],
      inadmissibility_flags: [
        { value: 'criminality', label: 'Criminality' },
        { value: 'medical', label: 'Medical' },
        { value: 'misrepresentation', label: 'Misrepresentation' },
        { value: 'overstay', label: 'Overstay' },
        { value: 'none', label: 'None' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' }
      ],
      document_types: [
        { value: 'passport', label: 'Passport' },
        { value: 'language_test', label: 'Language Test' },
        { value: 'eca_report', label: 'ECA Report' },
        { value: 'job_offer_letter', label: 'Job Offer Letter' },
        { value: 'resume', label: 'Resume' },
        { value: 'police_certificate', label: 'Police Certificate' },
        { value: 'medical', label: 'Medical' },
        { value: 'financial_docs', label: 'Financial Documents' },
        { value: 'other', label: 'Other' }
      ],
      countries: [
        { value: 'canada', label: 'Canada' },
        { value: 'united_states', label: 'United States' },
        { value: 'united_kingdom', label: 'United Kingdom' },
        { value: 'australia', label: 'Australia' },
        { value: 'india', label: 'India' },
        { value: 'china', label: 'China' },
        { value: 'philippines', label: 'Philippines' },
        { value: 'nigeria', label: 'Nigeria' },
        { value: 'pakistan', label: 'Pakistan' },
        { value: 'france', label: 'France' },
        { value: 'germany', label: 'Germany' },
        { value: 'brazil', label: 'Brazil' },
        { value: 'other', label: 'Other' }
      ]
    }
  }
}

export const intakeService = new IntakeService()