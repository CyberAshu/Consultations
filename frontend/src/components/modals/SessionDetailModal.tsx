import React, { useState } from 'react'
import { Button } from '../shared/Button'
import { Badge } from '../ui/Badge'
import { X, FileText, Calendar, Clock, User, Upload, Download, Eye } from 'lucide-react'
import { Booking } from '../../services/types'
import { bookingService } from '../../services/bookingService'
import { SessionNotesSection } from '../sessionNotes/SessionNotesSection'
import { DocumentUpload } from '../shared/DocumentUpload'
import { intakeService, IntakeData } from '../../services/intakeService'
import jsPDF from 'jspdf'

// Enhanced booking interface with consultant and service details
interface EnhancedBooking extends Booking {
  consultant_name?: string
  consultant_rcic_number?: string
  service_name?: string
  service_description?: string
}

interface SessionDetailModalProps {
  show: boolean
  booking: EnhancedBooking | null
  clientName: string
  onClose: () => void
  onStatusChange: (bookingId: number, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'delayed' | 'rescheduled') => void
  onViewDocument?: (file: any, clientInfo: any) => void // Make optional
  onDownloadDocument: (file: any) => void
  updatingStatus: number | null
  onNotesUpdate: (bookingId: number, notes: string) => void
  isClientView?: boolean // Add optional prop for client view
  onDocumentUploadSuccess?: () => void // Optional callback for when documents are uploaded
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
    case 'upcoming':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'delayed':
      return 'bg-orange-100 text-orange-800'
    case 'rescheduled':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function SessionDetailModal({
  show,
  booking,
  clientName,
  onClose,
  onStatusChange,
  onViewDocument,
  onDownloadDocument,
  updatingStatus,
  onNotesUpdate,
  isClientView = false
}: SessionDetailModalProps) {
  const [notes, setNotes] = React.useState(booking?.meeting_notes || '')
  const [showDocumentModal, setShowDocumentModal] = React.useState(false)
  const [selectedDocument, setSelectedDocument] = React.useState<any>(null)
  const [activeTab, setActiveTab] = useState(isClientView ? 'overview' : 'overview')
  const [documents, setDocuments] = useState<any[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [detailedIntakeData, setDetailedIntakeData] = useState<IntakeData | null>(null)
  const [intakeLoading, setIntakeLoading] = useState(false)

  React.useEffect(() => {
    setNotes(booking?.meeting_notes || '')
    
    // Load documents and intake data when modal opens
    if (booking) {
      // Load both intake data and documents
      const loadData = async () => {
        // First load documents with basic intake data
        await loadBookingDocuments()
        // Then load detailed intake data
        await loadDetailedIntakeData()
        // Finally reload documents with detailed intake data
        await loadBookingDocuments()
      }
      loadData()
    }
  }, [booking])

  // Load documents with proper signed URLs from API
  const loadBookingDocuments = async () => {
    if (!booking) return
    
    try {
      setDocumentsLoading(true)
      const documentsData = await bookingService.getBookingDocuments(booking.id)
      console.log('📄 Loaded booking documents with signed URLs:', documentsData)
      
      let allDocuments = documentsData.documents || []
      
      // Also check for intake form documents
      console.log('🔍 Checking for intake documents in parsedIntakeData:', {
        hasData: !!parsedIntakeData,
        hasUploadedFiles_camelCase: !!parsedIntakeData?.uploadedFiles,
        uploadedFiles_length: Array.isArray(parsedIntakeData?.uploadedFiles) ? parsedIntakeData.uploadedFiles.length : 'not array',
        hasUploadedFiles_underscore: !!parsedIntakeData?.uploaded_files,
        uploaded_files_length: Array.isArray(parsedIntakeData?.uploaded_files) ? parsedIntakeData.uploaded_files.length : 'not array',
        allKeys: parsedIntakeData ? Object.keys(parsedIntakeData) : 'no data',
        // Show the uploadedFiles content
        uploadedFilesContent: parsedIntakeData?.uploadedFiles
      })
      
      // Check multiple possible intake document locations  
      let intakeFiles = null
      if (parsedIntakeData?.uploadedFiles && Array.isArray(parsedIntakeData.uploadedFiles)) {
        intakeFiles = parsedIntakeData.uploadedFiles
        console.log('✅ Found uploadedFiles (camelCase):', intakeFiles)
      } else if (parsedIntakeData?.uploaded_files && Array.isArray(parsedIntakeData.uploaded_files)) {
        intakeFiles = parsedIntakeData.uploaded_files
        console.log('✅ Found uploaded_files (underscore):', intakeFiles)
      } else if (parsedIntakeData?.documents && Array.isArray(parsedIntakeData.documents)) {
        intakeFiles = parsedIntakeData.documents
        console.log('✅ Found documents:', intakeFiles)
      } else if (parsedIntakeData?.files && Array.isArray(parsedIntakeData.files)) {
        intakeFiles = parsedIntakeData.files
        console.log('✅ Found files:', intakeFiles)
      }
      
      if (intakeFiles && intakeFiles.length > 0) {
        console.log('📄 Found intake form documents:', intakeFiles)
        
        // Add intake documents to the list with a special flag
        const intakeDocuments = intakeFiles.map((file: any, index: number) => {
          console.log(`🔍 Processing intake file ${index}:`, file)
          
          return {
            id: file.id || `intake_${index}`, // Use original ID if available
            file_name: file.name || file.fileName || file.file_name || `Intake Document ${index + 1}`,
            file_size: file.size || file.fileSize || file.file_size || 0,
            file_type: file.type || file.fileType || file.file_type || 'application/octet-stream',
            download_url: file.url || file.dataUrl || file.base64Content || file.download_url || null,
            uploaded_at: file.uploadedAt || file.uploaded_at || booking.created_at,
            created_at: file.uploadedAt || file.uploaded_at || booking.created_at,
            source: 'intake_form', // Mark as intake document
            is_intake_file: true, // Special flag for intake files
            original_file_data: file, // Keep original data for debugging
            ...file // Include all original properties
          }
        })
        
        allDocuments = [...allDocuments, ...intakeDocuments]
        console.log('📄 Combined documents (booking + intake):', allDocuments)
      }
      
      // Also check if we have detailed intake data with document names
      // This will be available after loadDetailedIntakeData completes
      if (detailedIntakeData?.docs_ready && Array.isArray(detailedIntakeData.docs_ready) && detailedIntakeData.docs_ready.length > 0) {
        console.log('📄 Found document names from detailed intake (Stage 12):', detailedIntakeData.docs_ready)
        
        // Try to match document names with uploaded files
        const matchedDocs = detailedIntakeData.docs_ready.map((docName: string, index: number) => {
          // Try to find a matching uploaded file
          const matchingFile = parsedIntakeData?.uploadedFiles?.find((file: any) => 
            file.name?.toLowerCase().includes(docName.toLowerCase()) ||
            docName.toLowerCase().includes(file.name?.toLowerCase().split('.')[0] || '')
          )
          
          if (matchingFile) {
            console.log(`✅ Matched "${docName}" with uploaded file:`, matchingFile)
            return {
              id: matchingFile.id || `intake_matched_${index}`,
              file_name: `${matchingFile.name} (${docName})`,
              file_size: matchingFile.size || 0,
              file_type: matchingFile.type || 'application/octet-stream',
              download_url: null, // File content not available for download
              uploaded_at: matchingFile.uploadedAt || booking.created_at,
              created_at: matchingFile.uploadedAt || booking.created_at,
              source: 'intake_form',
              is_intake_file: true,
              matched_doc_name: docName,
              original_file_data: matchingFile
            }
          } else {
            console.log(`⚠️ Could not match "${docName}" with any uploaded file`)
            return null
          }
        }).filter(Boolean)
        
        // Add matched documents to the list if we don't already have them
        const existingIntakeIds = allDocuments.filter((doc: any) => doc.source === 'intake_form').map((doc: any) => doc.id)
        const newMatchedDocs = matchedDocs.filter((doc: any) => doc && !existingIntakeIds.includes(doc.id))
        
        if (newMatchedDocs.length > 0) {
          allDocuments = [...allDocuments, ...newMatchedDocs] as any[]
          console.log('📄 Added matched documents from detailed intake:', newMatchedDocs)
        }
      } else {
        console.log('🚨 No actual intake document files found')
        console.log('📋 Available data structure for debugging:', {
          parsedIntakeData: parsedIntakeData ? Object.keys(parsedIntakeData) : null,
          education_work_keys: parsedIntakeData?.education_work ? Object.keys(parsedIntakeData.education_work) : null,
          goals_timeline_keys: parsedIntakeData?.goals_timeline ? Object.keys(parsedIntakeData.goals_timeline) : null,
          formData_keys: parsedIntakeData?.formData ? Object.keys(parsedIntakeData.formData) : null,
          // Check if there are any file-like objects in nested structures
          nestedCheck: parsedIntakeData ? JSON.stringify(parsedIntakeData, (key, value) => {
            // Look for objects that might contain file data
            if (typeof value === 'object' && value && (
              value.hasOwnProperty('name') || 
              value.hasOwnProperty('fileName') ||
              value.hasOwnProperty('size') ||
              value.hasOwnProperty('type') ||
              value.hasOwnProperty('dataUrl') ||
              value.hasOwnProperty('base64')
            )) {
              return `[POTENTIAL FILE OBJECT: ${Object.keys(value).join(', ')}]`
            }
            return value
          }, 2) : null
        })
      }
      
      setDocuments(allDocuments)
    } catch (error) {
      console.error('Error loading documents:', error)
      // Fallback to original documents if API fails
      setDocuments(booking?.documents || [])
    } finally {
      setDocumentsLoading(false)
    }
  }

  // Load detailed intake form data (12 stages)
  const loadDetailedIntakeData = async () => {
    if (!booking?.client_id) {
      console.log('❌ No client_id found in booking')
      return
    }
    
    try {
      setIntakeLoading(true)
      console.log('🔄 Loading detailed intake data for client:', booking.client_id)
      
      // Check if we already have detailed intake data in booking (which we do!)
      if (parsedIntakeData?.personal_info || parsedIntakeData?.formatted_text || parsedIntakeData?.completion_status) {
        console.log('✅ Found complete detailed intake data in booking!')
        console.log('📝 Available data sections:', {
          personal_info: !!parsedIntakeData.personal_info,
          immigration_profile: !!parsedIntakeData.immigration_profile,
          education_work: !!parsedIntakeData.education_work,
          current_status: !!parsedIntakeData.current_status,
          formatted_text: !!parsedIntakeData.formatted_text,
          completion_status: !!parsedIntakeData.completion_status
        })
        
        // Convert the existing detailed data to IntakeData format
        const detailedIntake: IntakeData = {
          id: parsedIntakeData.existingIntake?.id || 0,
          client_id: booking.client_id,
          status: 'completed' as any,
          current_stage: parsedIntakeData.completion_status?.current_stage || 12,
          completed_stages: Array.from({length: parsedIntakeData.completion_status?.completed_stages || 12}, (_, i) => i + 1),
          created_at: parsedIntakeData.existingIntake?.created_at || new Date().toISOString(),
          updated_at: parsedIntakeData.existingIntake?.updated_at,
          completed_at: parsedIntakeData.existingIntake?.completed_at,
          completion_percentage: parsedIntakeData.completion_status?.completion_percentage || 100,
          
          // Personal Information from parsed data
          full_name: parsedIntakeData.personal_info?.full_name || 'Not provided',
          email: parsedIntakeData.personal_info?.email || 'Not provided',
          phone: parsedIntakeData.personal_info?.phone || 'Not provided',
          location: parsedIntakeData.personal_info?.location?.toLowerCase().replace(' ', '_') as any,
          client_role: parsedIntakeData.personal_info?.client_role?.toLowerCase().replace('/', '_').replace(' ', '_') as any,
          preferred_language: parsedIntakeData.personal_info?.preferred_language,
          timezone: parsedIntakeData.personal_info?.timezone,
          marital_status: parsedIntakeData.personal_info?.marital_status?.toLowerCase() as any,
          has_dependants: parsedIntakeData.personal_info?.has_dependants,
          dependants_count: parsedIntakeData.personal_info?.dependants_count,
          
          // Education & Work
          highest_education: parsedIntakeData.education_work?.highest_education?.toLowerCase().replace(' ', '_') as any,
          eca_status: parsedIntakeData.education_work?.eca_status?.toLowerCase() as any,
          eca_provider: parsedIntakeData.education_work?.eca_provider,
          language_test_taken: parsedIntakeData.education_work?.language_test_taken,
          test_type: parsedIntakeData.education_work?.test_type as any,
          test_date: parsedIntakeData.education_work?.test_date,
          language_scores: parsedIntakeData.education_work?.language_scores,
          years_experience: parsedIntakeData.education_work?.years_experience,
          noc_codes: parsedIntakeData.education_work?.noc_codes,
          teer_level: parsedIntakeData.education_work?.teer_level as any,
          
          // Current Status & Job Offer
          job_offer_status: parsedIntakeData.current_status?.job_offer_status?.toLowerCase() as any,
          employer_name: parsedIntakeData.current_status?.employer_name,
          lmia_status: parsedIntakeData.current_status?.lmia_status as any,
          current_status: parsedIntakeData.current_status?.current_status?.toLowerCase() as any,
          status_expiry: parsedIntakeData.current_status?.status_expiry,
          proof_of_funds: parsedIntakeData.current_status?.proof_of_funds?.toLowerCase().replace(/[$,\s]/g, '_').replace(/-/g, '_to_') as any,
          family_ties: parsedIntakeData.current_status?.family_ties,
          
          // Immigration Goals
          program_interest: parsedIntakeData.immigration_profile?.program_interest,
          province_interest: parsedIntakeData.immigration_profile?.province_interest,
          urgency: parsedIntakeData.immigration_profile?.urgency?.toLowerCase() as any,
          target_arrival: parsedIntakeData.goals_timeline?.target_arrival || parsedIntakeData.immigration_profile?.target_arrival,
          prior_applications: parsedIntakeData.immigration_profile?.prior_applications,
          application_outcomes: parsedIntakeData.immigration_profile?.application_outcomes,
          inadmissibility_flags: parsedIntakeData.immigration_profile?.inadmissibility_flags,
          docs_ready: parsedIntakeData.goals_timeline?.docs_ready,
          
          // Formatted text for fallback
          formatted_text: parsedIntakeData.formatted_text
        } as IntakeData
        
        console.log('✅ Converted detailed intake data:', detailedIntake)
        setDetailedIntakeData(detailedIntake)
        return
      }
      
      // Fallback: Check if we have existingIntake summary data
      if (parsedIntakeData?.existingIntake?.id) {
        console.log('✅ Found existing intake summary (fallback):', {
          id: parsedIntakeData.existingIntake.id,
          status: parsedIntakeData.existingIntake.status,
          completion: parsedIntakeData.existingIntake.completion_percentage + '%',
          completed_stages: parsedIntakeData.existingIntake.completed_stages?.length || 0
        })
        
        // API failed, create mock detailed data from existing intake summary
        console.log('🔍 Creating detailed intake data from existing summary...')
        const mockDetailedIntake: IntakeData = {
          id: parsedIntakeData.existingIntake.id,
          client_id: parsedIntakeData.existingIntake.client_id,
          status: parsedIntakeData.existingIntake.status as any,
          current_stage: parsedIntakeData.existingIntake.current_stage,
          completed_stages: parsedIntakeData.existingIntake.completed_stages || [],
          created_at: parsedIntakeData.existingIntake.created_at,
          updated_at: parsedIntakeData.existingIntake.updated_at,
          completed_at: parsedIntakeData.existingIntake.completed_at,
          
          // Add basic intake info if available
          full_name: 'Client Name Not Available (See booking details)',
          email: 'Email not provided in intake summary',
          phone: 'Phone not provided in intake summary',
          
          // Add completion status info
          completion_percentage: parsedIntakeData.existingIntake.completion_percentage || 0,
        } as IntakeData
        
        // Add form data info if available
        if (parsedIntakeData.formData) {
          if (parsedIntakeData.formData.immigrationStatus) {
            mockDetailedIntake.immigration_status_note = parsedIntakeData.formData.immigrationStatus
          }
          if (parsedIntakeData.formData.immigrationGoal) {
            mockDetailedIntake.immigration_goal_note = parsedIntakeData.formData.immigrationGoal
          }
          if (parsedIntakeData.formData.specificQuestions) {
            mockDetailedIntake.specific_questions = parsedIntakeData.formData.specificQuestions
          }
          if (parsedIntakeData.formData.previousApplications) {
            mockDetailedIntake.previous_applications_summary = JSON.stringify(parsedIntakeData.formData.previousApplications, null, 2)
          }
        }
        
        console.log('✅ Created mock detailed intake data:', mockDetailedIntake)
        setDetailedIntakeData(mockDetailedIntake)
        
      } else {
        console.log('⚠️ No existing intake data found')
        setDetailedIntakeData(null)
      }
      
    } catch (error: any) {
      console.error('❌ Unexpected error in loadDetailedIntakeData:', error)
      setDetailedIntakeData(null)
    } finally {
      setIntakeLoading(false)
      console.log('🔄 Intake loading completed')
    }
  }

  // Format intake data as proper Q&A based on actual stage questions
  const formatIntakeAsQA = (intakeData: IntakeData): string => {
    let formatted = '=== CLIENT INTAKE FORM - DETAILED RESPONSES ===\n\n'

    try {
      // Use embedded detailed intake data from booking if available
      const detailedData = intakeData
      
      // Header with client info
      formatted += 'CLIENT INFORMATION:\n'
      formatted += `Name: ${detailedData.full_name || 'Not provided'}\n`
      formatted += `Email: ${detailedData.email || 'Not provided'}\n`
      formatted += `Phone: ${detailedData.phone || 'Not provided'}\n`
      formatted += `Form ID: ${detailedData.id || 'N/A'}\n`
      formatted += `Status: ${detailedData.status?.toUpperCase() || 'IN PROGRESS'}\n`
      formatted += `Last Updated: ${detailedData.updated_at ? new Date(detailedData.updated_at).toLocaleDateString() : 'N/A'}\n\n`
      
      // Stage 1: Location & Role
      if (detailedData.location || detailedData.client_role) {
        formatted += '--- STAGE 1: LOCATION & ROLE ---\n\n'
        if (detailedData.location) {
          formatted += 'Q1.1: Where are you completing this form from?\n'
          formatted += `A: ${detailedData.location === 'inside_canada' ? 'Inside Canada' : 
                            detailedData.location === 'outside_canada' ? 'Outside Canada' : 
                            detailedData.location.replace('_', ' ')}\n\n`
        }
        if (detailedData.client_role) {
          formatted += 'Q1.2: What is your role in this process?\n'
          formatted += `A: ${detailedData.client_role === 'principal_applicant' ? 'Principal Applicant' : 
                            detailedData.client_role === 'sponsor' ? 'Sponsor' : 
                            detailedData.client_role.replace('_', ' ')}\n\n`
        }
      }

      // Stage 2: Identity, Contact & Consent
      formatted += '--- STAGE 2: IDENTITY, CONTACT & CONSENT ---\n\n'
      if (detailedData.full_name) {
        formatted += 'Q2.1: Full Name\n'
        formatted += `A: ${detailedData.full_name}\n\n`
      }
      if (detailedData.email) {
        formatted += 'Q2.2: Email Address\n'
        formatted += `A: ${detailedData.email}\n\n`
      }
      if (detailedData.phone) {
        formatted += 'Q2.3: Phone Number (Optional)\n'
        formatted += `A: ${detailedData.phone}\n\n`
      }
      if (detailedData.preferred_language) {
        formatted += 'Q2.4: Preferred Language for Communication\n'
        formatted += `A: ${detailedData.preferred_language}${detailedData.preferred_language_other ? ` (${detailedData.preferred_language_other})` : ''}\n\n`
      }
      if (detailedData.timezone) {
        formatted += 'Q2.5: Your Timezone\n'
        formatted += `A: ${detailedData.timezone}\n\n`
      }
      if (detailedData.consent_acknowledgement) {
        formatted += 'Q2.6: Consent & Privacy Acknowledgements\n'
        formatted += `A: Confirmed - ${Array.isArray(detailedData.consent_acknowledgement) ? detailedData.consent_acknowledgement.length : '0'} items acknowledged\n\n`
      }

      // Stage 3: Household Composition  
      if (detailedData.marital_status || detailedData.has_dependants !== undefined) {
        formatted += '--- STAGE 3: HOUSEHOLD COMPOSITION ---\n\n'
        if (detailedData.marital_status) {
          formatted += 'Q3.1: What is your marital status?\n'
          formatted += `A: ${detailedData.marital_status.replace('_', ' ')}\n\n`
        }
        if (detailedData.has_dependants !== undefined) {
          formatted += 'Q3.2: Do you have children or dependants?\n'
          formatted += `A: ${detailedData.has_dependants ? 'Yes' : 'No'}\n\n`
          if (detailedData.has_dependants && detailedData.dependants_count) {
            formatted += 'Q3.3: How many dependants will be part of your application?\n'
            formatted += `A: ${detailedData.dependants_count}\n\n`
          }
          if (detailedData.has_dependants && detailedData.dependants_accompanying) {
            formatted += 'Q3.4: Will your dependants accompany you to Canada?\n'
            formatted += `A: ${detailedData.dependants_accompanying}\n\n`
          }
        }
      }

      // Stage 4: Education History
      if (detailedData.highest_education || detailedData.eca_status) {
        formatted += '--- STAGE 4: EDUCATION HISTORY ---\n\n'
        if (detailedData.highest_education) {
          formatted += 'Q4.1: What is your highest completed level of education?\n'
          formatted += `A: ${detailedData.highest_education.replace('_', ' ')}\n\n`
        }
        if (detailedData.eca_status) {
          formatted += 'Q4.2: Have you had your education assessed by an ECA organization?\n'
          formatted += `A: ${detailedData.eca_status}\n\n`
          if (detailedData.eca_status === 'yes') {
            if (detailedData.eca_provider) {
              formatted += 'Q4.3: Who issued your ECA?\n'
              formatted += `A: ${detailedData.eca_provider}\n\n`
            }
            if (detailedData.eca_result) {
              formatted += 'Q4.4: What Canadian equivalency was shown on your ECA?\n'
              formatted += `A: ${detailedData.eca_result.replace('_', ' ')}\n\n`
            }
          }
        }
      }

      // Stage 5: Language Skills
      if (detailedData.language_test_taken) {
        formatted += '--- STAGE 5: LANGUAGE SKILLS ---\n\n'
        formatted += 'Q5.1: Have you taken a language test?\n'
        formatted += `A: ${detailedData.language_test_taken}\n\n`
        if (detailedData.language_test_taken === 'yes') {
          if (detailedData.test_type) {
            formatted += 'Q5.2: What test did you take?\n'
            formatted += `A: ${detailedData.test_type.toUpperCase()}\n\n`
          }
          if (detailedData.test_date) {
            formatted += 'Q5.3: Date of most recent test\n'
            formatted += `A: ${new Date(detailedData.test_date).toLocaleDateString()}\n\n`
          }
          if (detailedData.language_scores) {
            formatted += `Q5.4: Your ${detailedData.test_type?.toUpperCase()} scores:\n`
            formatted += `A: `
            if (detailedData.language_scores.listening) formatted += `Listening: ${detailedData.language_scores.listening}, `
            if (detailedData.language_scores.speaking) formatted += `Speaking: ${detailedData.language_scores.speaking}, `
            if (detailedData.language_scores.reading) formatted += `Reading: ${detailedData.language_scores.reading}, `
            if (detailedData.language_scores.writing) formatted += `Writing: ${detailedData.language_scores.writing}`
            formatted += '\n\n'
          }
        }
      }

      // Stage 6: Work History
      if (detailedData.years_experience !== undefined) {
        formatted += '--- STAGE 6: WORK HISTORY ---\n\n'
        formatted += 'Q6.1: How many years of full-time skilled work experience do you have?\n'
        formatted += `A: ${detailedData.years_experience} years\n\n`
        if (detailedData.noc_codes && Array.isArray(detailedData.noc_codes) && detailedData.noc_codes.length > 0) {
          formatted += 'Q6.2: What job titles have you held (NOC if known)?\n'
          formatted += `A: ${detailedData.noc_codes.join(', ')}\n\n`
        }
        if (detailedData.teer_level) {
          formatted += 'Q6.3: TEER level of your main occupation\n'
          formatted += `A: TEER ${detailedData.teer_level}\n\n`
        }
        if (detailedData.regulated_occupation) {
          formatted += 'Q6.4: Is your job a regulated occupation in Canada?\n'
          formatted += `A: ${detailedData.regulated_occupation}\n\n`
        }
        if (detailedData.work_country && Array.isArray(detailedData.work_country) && detailedData.work_country.length > 0) {
          formatted += 'Q6.5: Where did you gain this experience?\n'
          formatted += `A: ${detailedData.work_country.join(', ')}\n\n`
        }
      }

      // Stage 7: Job Offer & LMIA
      if (detailedData.job_offer_status) {
        formatted += '--- STAGE 7: JOB OFFER & LMIA ---\n\n'
        formatted += 'Q7.1: Do you have a job offer in Canada?\n'
        formatted += `A: ${detailedData.job_offer_status}\n\n`
        if (detailedData.job_offer_status === 'yes') {
          if (detailedData.employer_name) {
            formatted += 'Q7.2: Employer/company name\n'
            formatted += `A: ${detailedData.employer_name}\n\n`
          }
          if (detailedData.job_location) {
            formatted += 'Q7.3: Province & city of job offer\n'
            let location = ''
            if (detailedData.job_location.city) location += detailedData.job_location.city + ', '
            if (detailedData.job_location.province) location += detailedData.job_location.province
            formatted += `A: ${location || 'Location details not provided'}\n\n`
          }
          if (detailedData.wage_offer) {
            formatted += 'Q7.4: What is the offered wage (CAD/hour)?\n'
            formatted += `A: $${detailedData.wage_offer}/hour\n\n`
          }
          if (detailedData.lmia_status) {
            formatted += 'Q7.5: LMIA status\n'
            formatted += `A: ${detailedData.lmia_status}\n\n`
          }
        }
      }

      // Stage 8: Status in Canada (only if inside Canada)
      if (detailedData.location === 'inside_canada' && detailedData.current_status) {
        formatted += '--- STAGE 8: STATUS IN CANADA ---\n\n'
        formatted += 'Q8.1: What is your current status in Canada?\n'
        formatted += `A: ${detailedData.current_status.replace('_', ' ')}\n\n`
        if (detailedData.status_expiry) {
          formatted += 'Q8.2: When does your current status expire?\n'
          formatted += `A: ${new Date(detailedData.status_expiry).toLocaleDateString()}\n\n`
        }
        if (detailedData.province_residing) {
          formatted += 'Q8.3: Which province are you currently living in?\n'
          formatted += `A: ${detailedData.province_residing.replace('_', ' ')}\n\n`
        }
      }

      // Stage 9: Proof of Funds & Settlement Ties
      if (detailedData.proof_of_funds || detailedData.family_ties !== undefined) {
        formatted += '--- STAGE 9: PROOF OF FUNDS & SETTLEMENT TIES ---\n\n'
        if (detailedData.proof_of_funds) {
          formatted += 'Q9.1: How much do you have available to support yourself/family?\n'
          formatted += `A: ${detailedData.proof_of_funds.replace('_', ' ')}\n\n`
        }
        if (detailedData.family_ties !== undefined) {
          formatted += 'Q9.2: Do you have close family in Canada?\n'
          formatted += `A: ${detailedData.family_ties ? 'Yes' : 'No'}\n\n`
          if (detailedData.family_ties && detailedData.relationship_type) {
            formatted += 'Q9.3: What is their relationship to you?\n'
            formatted += `A: ${detailedData.relationship_type.replace('_', ' ')}\n\n`
          }
        }
      }

      // Stage 10: Application History & Inadmissibility
      if (detailedData.prior_applications !== undefined || detailedData.inadmissibility_flags) {
        formatted += '--- STAGE 10: APPLICATION HISTORY & INADMISSIBILITY ---\n\n'
        if (detailedData.prior_applications !== undefined) {
          formatted += 'Q10.1: Have you previously applied to Canada?\n'
          formatted += `A: ${detailedData.prior_applications ? 'Yes' : 'No'}\n\n`
          if (detailedData.prior_applications && detailedData.application_outcomes && Array.isArray(detailedData.application_outcomes) && detailedData.application_outcomes.length > 0) {
            formatted += 'Q10.2: Any prior refusals or withdrawals?\n'
            formatted += `A: ${detailedData.application_outcomes.join(', ')}\n\n`
          }
        }
        if (detailedData.inadmissibility_flags && Array.isArray(detailedData.inadmissibility_flags) && detailedData.inadmissibility_flags.length > 0) {
          formatted += 'Q10.3: Have you ever faced any inadmissibility issues?\n'
          formatted += `A: ${detailedData.inadmissibility_flags.includes('none') ? 'No issues identified' : detailedData.inadmissibility_flags.join(', ')}\n\n`
        }
      }

      // Stage 11: Provincial/Program Interest
      if (detailedData.program_interest || detailedData.province_interest) {
        formatted += '--- STAGE 11: PROVINCIAL/PROGRAM INTEREST ---\n\n'
        if (detailedData.program_interest && Array.isArray(detailedData.program_interest) && detailedData.program_interest.length > 0) {
          formatted += 'Q11.1: Are you interested in any specific immigration program?\n'
          formatted += `A: ${detailedData.program_interest.join(', ').replace(/_/g, ' ')}\n\n`
        }
        if (detailedData.province_interest && Array.isArray(detailedData.province_interest) && detailedData.province_interest.length > 0) {
          formatted += 'Q11.2: Are you targeting any specific province/territory?\n'
          formatted += `A: ${detailedData.province_interest.join(', ').replace(/_/g, ' ')}\n\n`
        }
      }

      // Stage 12: Timeline & Document Readiness
      if (detailedData.urgency || detailedData.target_arrival || detailedData.docs_ready) {
        formatted += '--- STAGE 12: TIMELINE & DOCUMENT READINESS ---\n\n'
        if (detailedData.urgency) {
          formatted += 'Q12.1: How soon are you hoping to move forward?\n'
          formatted += `A: ${detailedData.urgency.replace('_', ' ')}\n\n`
        }
        if (detailedData.target_arrival) {
          formatted += 'Q12.2: Target arrival or application date\n'
          formatted += `A: ${new Date(detailedData.target_arrival).toLocaleDateString()}\n\n`
        }
        if (detailedData.docs_ready && Array.isArray(detailedData.docs_ready) && detailedData.docs_ready.length > 0) {
          formatted += 'Q12.3: Which documents do you already have?\n'
          formatted += `A: ${detailedData.docs_ready.join(', ').replace(/_/g, ' ')}\n\n`
        }
        if (detailedData.uploaded_files && Array.isArray(detailedData.uploaded_files) && detailedData.uploaded_files.length > 0) {
          formatted += 'Q12.4: Documents uploaded for review\n'
          formatted += `A: ${detailedData.uploaded_files.length} files uploaded\n\n`
        }
      }

      // Completion Summary
      formatted += '\n=== INTAKE FORM COMPLETION SUMMARY ===\n'
      formatted += `Status: ${detailedData.status?.toUpperCase() || 'IN PROGRESS'}\n`
      formatted += `Completion: ${detailedData.completion_percentage || intakeService.getStageCompletionPercentage(detailedData)}%\n`
      if (detailedData.completed_stages && Array.isArray(detailedData.completed_stages)) {
        formatted += `Completed Stages: ${detailedData.completed_stages.length}/12 (${detailedData.completed_stages.sort((a, b) => a - b).join(', ')})\n`
      }
      if (detailedData.completed_at) {
        formatted += `Completed On: ${new Date(detailedData.completed_at).toLocaleDateString()}\n`
      }
      
      formatted += '\n=== END OF INTAKE FORM ==='
      
    } catch (error) {
      console.error('Error formatting intake data:', error)
      formatted += 'Error formatting intake data. Please check with your consultant.\n'
      
      // Fallback: Show basic data structure info
      if (intakeData) {
        formatted += `\nAvailable data fields: ${Object.keys(intakeData).join(', ')}\n`
        formatted += `\nBasic Info:\n`
        formatted += `- Name: ${intakeData.full_name || 'Not available'}\n`
        formatted += `- Email: ${intakeData.email || 'Not available'}\n`
        formatted += `- Status: ${intakeData.status || 'Not available'}\n`
        formatted += `- Form ID: ${intakeData.id || 'Not available'}\n`
      }
    }

    return formatted
  }

  // Export as Text
  const exportAsText = (intakeData: IntakeData) => {
    const qaText = formatIntakeAsQA(intakeData)
    const blob = new Blob([qaText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${intakeData.full_name || 'Client'}_Intake_Form_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Export as PDF
  const exportToPDF = (intakeData: IntakeData) => {
    const doc = new jsPDF()
    const qaText = formatIntakeAsQA(intakeData)
    const lines = qaText.split('\n')
    
    let yPosition = 20
    const lineHeight = 6
    const pageHeight = 280
    
    // Set default font
    doc.setFont('helvetica')
    doc.setFontSize(10)
    
    lines.forEach((line) => {
      // Check if we need a new page
      if (yPosition > pageHeight) {
        doc.addPage()
        yPosition = 20
      }
      
      // Handle different line types with better styling
      if (line.includes('=== ') && line.includes(' ===')) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
      } else if (line.includes('--- ') && line.includes(' ---')) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
      } else if (line.startsWith('Q')) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
      } else if (line.startsWith('A:')) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
      } else {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
      }
      
      // Split long lines to fit page width
      const maxWidth = 180
      const splitLines = doc.splitTextToSize(line, maxWidth)
      
      splitLines.forEach((splitLine: string) => {
        if (yPosition > pageHeight) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(splitLine, 20, yPosition)
        yPosition += lineHeight
      })
    })
    
    // Save the PDF
    const fileName = `${intakeData.full_name || 'Client'}_Intake_Form_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  // Parse intake form data at component level so it's accessible everywhere
  const parseIntakeData = () => {
    if (!booking?.intake_form_data) return null
    
    let parsedData = booking.intake_form_data
    if (typeof booking.intake_form_data === 'string') {
      try {
        parsedData = JSON.parse(booking.intake_form_data)
        console.log('✅ SessionDetailModal: Parsed intake data:', parsedData)
      } catch (error) {
        console.error('❌ SessionDetailModal: Failed to parse intake form JSON:', error)
        console.log('Raw string data:', booking.intake_form_data)
        return null
      }
    }
    return parsedData
  }
  
  const parsedIntakeData = parseIntakeData()
  
  if (!show || !booking) return null

  // 🔥 ADDITIONAL NESTED JSON PARSING
  // Some fields might still be JSON strings even after initial parsing
  if (parsedIntakeData && typeof parsedIntakeData === 'object') {
    console.log('🔍 SessionDetailModal: Checking for nested JSON strings...')
    
    // Function to recursively parse nested JSON strings
    const parseNestedJson = (obj: any, path = ''): any => {
      if (typeof obj === 'string' && (obj.startsWith('{') || obj.startsWith('['))) {
        try {
          const parsed = JSON.parse(obj)
          console.log(`🔧 SessionDetailModal: Parsed nested JSON at '${path}':`, parsed)
          return parseNestedJson(parsed, path) // Recursively parse in case there are more nested strings
        } catch (e) {
          console.log(`⚠️ SessionDetailModal: Could not parse '${path}' as JSON:`, e)
          return obj
        }
      } else if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        // Process nested objects
        const processed = { ...obj }
        Object.keys(processed).forEach(key => {
          const newPath = path ? `${path}.${key}` : key
          processed[key] = parseNestedJson(processed[key], newPath)
        })
        return processed
      } else if (Array.isArray(obj)) {
        // Process arrays
        return obj.map((item, index) => parseNestedJson(item, `${path}[${index}]`))
      }
      return obj
    }
    
    // Apply recursive parsing
    Object.keys(parsedIntakeData).forEach(key => {
      parsedIntakeData[key] = parseNestedJson(parsedIntakeData[key], key)
    })
    
  console.log('✅ SessionDetailModal: Final processed intake data:', parsedIntakeData)
  console.log('🔍 SessionDetailModal: Intake data keys:', parsedIntakeData ? Object.keys(parsedIntakeData) : 'No data')
  console.log('🔍 SessionDetailModal: Intake data type:', typeof parsedIntakeData)
  console.log('🔍 SessionDetailModal: Full intake data structure:', JSON.stringify(parsedIntakeData, null, 2))
  
  // 🔥 SPECIFIC DEBUGGING FOR FORM DATA
  if (parsedIntakeData.formData) {
    console.log('🔍 SessionDetailModal: formData contents:', parsedIntakeData.formData)
    if (parsedIntakeData.formData.previousApplications) {
      console.log('🔍 SessionDetailModal: previousApplications:', parsedIntakeData.formData.previousApplications)
      console.log('🔍 SessionDetailModal: previousApplications type:', typeof parsedIntakeData.formData.previousApplications)
    }
  }
  }

  const hasIntakeForm = parsedIntakeData
  const hasDocuments = booking.documents && booking.documents.length > 0
  const bookingDate = new Date(booking.booking_date || booking.scheduled_date || '')

  // Document upload handlers
  const handleDocumentUploadSuccess = (uploadedDocument: any) => {
    console.log('Document uploaded successfully:', uploadedDocument)
    // Always reload documents from API to get proper signed URLs
    loadBookingDocuments()
    // You could also show a success toast here
    alert('Document uploaded successfully!')
  }

  const handleDocumentUploadError = (error: string) => {
    console.error('Document upload failed:', error)
    alert(`Document upload failed: ${error}`)
  }

  // Tab configuration for client view
  const clientTabs = [
    { id: 'overview', label: 'Session Overview', icon: <Eye className="h-4 w-4" /> },
    { id: 'intake', label: 'Intake Information', icon: <User className="h-4 w-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
    { id: 'upload', label: 'Upload Documents', icon: <Upload className="h-4 w-4" /> }
  ]

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
  }

  const handleSaveNotes = async () => {
    try {
      await bookingService.updateBooking(booking.id, { meeting_notes: notes } as any)
      onNotesUpdate(booking.id, notes)
      alert('Notes saved successfully')
    } catch (err: any) {
      alert(`Failed to save notes: ${err.message}`)
    }
  }

  const handleSendNotes = async () => {
    try {
      if (!notes.trim()) {
        alert('Please enter some notes first')
        return
      }
      await fetch(`/api/v1/bookings/${booking.id}/send-notes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}` 
        },
        body: JSON.stringify({ notes })
      })
      alert('Notes sent to client successfully')
    } catch (err: any) {
      alert(`Failed to send notes: ${err.message}`)
    }
  }

  // Internal document viewing handlers
  const handleViewDocumentInternal = (file: any) => {
    const enhancedFile = {
      ...file,
      name: file.name || file.file_name || 'Unknown File',
      content: file.content || file.file_content || file.data || file.base64Content,
      url: file.url || file.file_url || file.download_url || file.file_path || file.uploadedFileUrl,
      type: file.type || file.file_type || file.mime_type || file.contentType || 'application/octet-stream',
      size: file.size || file.file_size || file.fileSize || 0,
      uploadedAt: file.uploadedAt || file.uploaded_at || file.createdAt || file.created_at || new Date().toISOString()
    }
    setSelectedDocument(enhancedFile)
    setShowDocumentModal(true)
  }

  const closeDocumentModal = () => {
    setShowDocumentModal(false)
    setSelectedDocument(null)
  }

  // Get current user role from localStorage or context
  const getCurrentUserRole = (): string => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user.role || 'client'
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
    }
    return isClientView ? 'client' : 'rcic' // fallback based on view type
  }

  const handleOpenInNewTab = (file: any) => {
    if (!file) return
    
    // 🔍 DEBUG: Log the file object to see what's available
    console.log('🔍 SessionDetailModal: handleOpenInNewTab file object:', file)
    console.log('🔍 SessionDetailModal: All file properties:', Object.keys(file))
    console.log('🔍 SessionDetailModal: Full file object stringified:', JSON.stringify(file, null, 2))
    console.log('🔍 SessionDetailModal: Available file properties:', {
      // URLs
      url: file.url,
      file_url: file.file_url,
      download_url: file.download_url,
      file_path: file.file_path,
      uploadedFileUrl: file.uploadedFileUrl,
      src: file.src,
      dataUrl: file.dataUrl,
      fileUrl: file.fileUrl,
      // Content
      content: file.content ? 'Present' : 'Not present',
      file_content: file.file_content ? 'Present' : 'Not present', 
      data: file.data ? 'Present' : 'Not present',
      base64Content: file.base64Content ? 'Present' : 'Not present',
      base64: file.base64 ? 'Present' : 'Not present',
      fileData: file.fileData ? 'Present' : 'Not present',
      result: file.result ? 'Present' : 'Not present',
      // Other potential fields
      blob: file.blob ? 'Present' : 'Not present',
      arrayBuffer: file.arrayBuffer ? 'Present' : 'Not present'
    })
    
    const fileUrl = file.url || file.file_url || file.download_url || file.file_path || file.uploadedFileUrl
    
    if (fileUrl) {
      console.log('✅ SessionDetailModal: Found file URL:', fileUrl)
      if (file.type?.startsWith('image/') || file.type === 'application/pdf') {
        window.open(fileUrl, '_blank')
      } else {
        if (file.type?.startsWith('text/')) {
          alert('Text file content is already displayed in the preview above.')
        } else {
          alert('This file type cannot be opened in a new tab. Please download it to view.')
        }
      }
    } else if (file.content || file.file_content || file.data || file.base64Content) {
      console.log('✅ SessionDetailModal: Found file content, creating blob...')
      try {
        const content = file.content || file.file_content || file.data || file.base64Content
        const blob = new Blob([content], { 
          type: file.type || 'application/octet-stream' 
        })
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
      } catch (err) {
        console.error('❌ SessionDetailModal: Failed to create blob:', err)
        alert('Unable to open file preview. Please download the file to view.')
      }
    } else {
      console.warn('⚠️ SessionDetailModal: No URL or content found for file')
      // Check if this is an intake form file with only metadata
      if (file.id && file.name && file.size && file.type && !file.url && !file.content) {
        alert(`File "${file.name}" appears to be an intake form upload that only saved metadata.\n\nThis can happen when:\n• File upload was interrupted\n• File storage service was unavailable\n• File was uploaded but not properly stored\n\nPlease ask the client to re-upload this document.`)
      } else {
        alert('File URL not available. This upload likely only saved metadata without a downloadable link.')
      }
    }
  }

  // Internal download function for modal documents
  const handleDownloadDocumentInternal = async (file: any) => {
    if (!file) return
    
    try {
      const fileUrl = file.url || file.file_url || file.download_url || file.file_path || file.uploadedFileUrl
      
      // Try to fetch and download the file
      if (fileUrl) {
        try {
          const response = await fetch(fileUrl)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = file.name || file.file_name || 'document'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          return
        } catch (fetchError) {
          // Fallback to direct download
          console.warn('Failed to fetch file for download, trying direct link:', fetchError)
          const link = document.createElement('a')
          link.href = fileUrl
          link.download = file.name || file.file_name || 'document'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          return
        }
      }
      
      // If we have file content, create blob for download
      if (file.content || file.file_content || file.data) {
        const content = file.content || file.file_content || file.data
        let blob
        
        // Handle base64 content
        if (typeof content === 'string' && content.includes('base64')) {
          const base64Data = content.split(',')[1] || content
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' })
        } else {
          blob = new Blob([content], { type: file.type || 'application/octet-stream' })
        }
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = file.name || file.file_name || 'document'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        return
      }
      
      alert('File is not accessible. It may need to be re-uploaded.')
    } catch (error: any) {
      console.error('Download failed:', error)
      alert(`Download failed: ${error.message || 'Please try again or contact support.'}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Session Details</h2>
            <p className="text-sm text-gray-600">{clientName} - {booking.service_name || booking.service_type || `Service #${booking.service_id}`}</p>
          </div>
          <Button variant="outline" onClick={onClose} size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Navigation - Only show for client view */}
        {isClientView && (
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {clientTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Tab Content */}
        {(!isClientView || activeTab === 'overview') && (
          <>
            {/* Client Information Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Client Name</p>
                <p className="text-gray-900 font-semibold">{clientName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-gray-900 text-sm">{parsedIntakeData?.personal_info?.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-gray-900 text-sm">{parsedIntakeData?.personal_info?.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Booking ID</p>
                <p className="text-gray-900 font-mono text-sm">#{booking.id}</p>
              </div>
            </div>
          </div>
          
          {/* Intake Data Display - New Extracted Format */}
          {hasIntakeForm && (() => {
            // Check if we have extracted intake data with our new format
            const hasExtractedData = parsedIntakeData.personal_info || parsedIntakeData.formatted_text
            
            if (hasExtractedData) {
              // New format from intake extraction service
              return (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-blue-900">Intake Information</h4>
                    {parsedIntakeData.completion_status && (
                      <div className="text-sm text-blue-600">
                        {parsedIntakeData.completion_status.completed_stages}/12 stages completed 
                        ({Math.round(parsedIntakeData.completion_status.completion_percentage)}%)
                      </div>
                    )}
                  </div>
                  
                  {/* Personal Information */}
                  {parsedIntakeData.personal_info && (
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">Personal Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {parsedIntakeData.personal_info.full_name && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Full Name</p>
                            <p className="text-sm text-gray-900">{parsedIntakeData.personal_info.full_name}</p>
                          </div>
                        )}
                        {parsedIntakeData.personal_info.email && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Email</p>
                            <p className="text-sm text-gray-900">{parsedIntakeData.personal_info.email}</p>
                          </div>
                        )}
                        {parsedIntakeData.personal_info.phone && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Phone</p>
                            <p className="text-sm text-gray-900">{parsedIntakeData.personal_info.phone}</p>
                          </div>
                        )}
                        {parsedIntakeData.personal_info.location && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Location</p>
                            <p className="text-sm text-gray-900">{parsedIntakeData.personal_info.location}</p>
                          </div>
                        )}
                        {parsedIntakeData.personal_info.client_role && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Role</p>
                            <p className="text-sm text-gray-900">{parsedIntakeData.personal_info.client_role}</p>
                          </div>
                        )}
                        {parsedIntakeData.personal_info.marital_status && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Marital Status</p>
                            <p className="text-sm text-gray-900">{parsedIntakeData.personal_info.marital_status}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Immigration Goals */}
                  {parsedIntakeData.immigration_profile && (
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">Immigration Profile</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {parsedIntakeData.immigration_profile.program_interest && parsedIntakeData.immigration_profile.program_interest.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Programs of Interest</p>
                            <p className="text-sm text-gray-900">{parsedIntakeData.immigration_profile.program_interest.join(', ')}</p>
                          </div>
                        )}
                        {parsedIntakeData.immigration_profile.urgency && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Timeline</p>
                            <p className="text-sm text-gray-900">{parsedIntakeData.immigration_profile.urgency}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Education & Work */}
                  {parsedIntakeData.education_work && (
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">Education & Experience</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {parsedIntakeData.education_work.highest_education && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Education</p>
                            <p className="text-sm text-gray-900">{parsedIntakeData.education_work.highest_education}</p>
                          </div>
                        )}
                        {parsedIntakeData.education_work.years_experience && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Work Experience</p>
                            <p className="text-sm text-gray-900">{parsedIntakeData.education_work.years_experience} years</p>
                          </div>
                        )}
                        {parsedIntakeData.education_work.test_type && (
                          <div>
                            <p className="text-xs font-medium text-gray-600">Language Test</p>
                            <p className="text-sm text-gray-900">{parsedIntakeData.education_work.test_type}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Export Actions for RCIC */}
                  {(detailedIntakeData || parsedIntakeData.formatted_text) && (
                    <div className="mt-4 pt-3 border-t border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-semibold text-gray-800">Export Client Intake Data</h5>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (detailedIntakeData) {
                                exportAsText(detailedIntakeData)
                              } else {
                                // Fallback export for formatted text
                                const blob = new Blob([parsedIntakeData.formatted_text], { type: 'text/plain' })
                                const url = URL.createObjectURL(blob)
                                const link = document.createElement('a')
                                link.href = url
                                link.download = `${clientName || 'Client'}_Intake_Summary_${new Date().toISOString().split('T')[0]}.txt`
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                                URL.revokeObjectURL(url)
                              }
                            }}
                            className="text-xs"
                          >
                            📄 Export Text
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-red-600 hover:bg-red-700 text-xs"
                            onClick={() => {
                              if (detailedIntakeData) {
                                exportToPDF(detailedIntakeData)
                              } else {
                                // Create mock intake data for PDF export
                                const mockData = {
                                  id: 0,
                                  client_id: booking.client_id || 'unknown',
                                  status: 'completed' as const,
                                  current_stage: 12,
                                  completed_stages: [1,2,3,4,5,6,7,8,9,10,11,12],
                                  full_name: clientName,
                                  email: 'See booking details',
                                  formatted_text: parsedIntakeData.formatted_text,
                                  created_at: new Date().toISOString()
                                } as IntakeData
                                exportToPDF(mockData)
                              }
                            }}
                          >
                            📄 Export PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Formatted Text Summary */}
                  {parsedIntakeData.formatted_text && (
                    <div className="mt-4">
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">Complete Summary</h5>
                      <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                          {parsedIntakeData.formatted_text}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )
            } else {
              // Fallback for old Quick Form format or simple intake data
              const getField = (fieldName: string) => {
                return parsedIntakeData[fieldName] || parsedIntakeData.formData?.[fieldName]
              }
              
              return (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <h4 className="text-md font-medium text-blue-900 mb-3">Quick Intake Info</h4>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      {parsedIntakeData.summary || 'Basic intake information provided during booking.'}
                    </p>
                    {getField('useExistingIntake') !== undefined && (
                      <p className="text-xs text-amber-600 mt-2">
                        Used existing intake data: {getField('useExistingIntake') ? 'Yes' : 'No'}
                      </p>
                    )}
                  </div>
                </div>
              )
            }
          })()}
        </div>

        {/* Session Overview */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4">Session Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Date & Time</p>
                <p className="text-gray-900">
                  {bookingDate.toLocaleDateString()} at {bookingDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Duration</p>
                <p className="text-gray-900">{booking.duration_minutes || 'N/A'} minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Service Type</p>
                <p className="text-gray-900">{booking.service_name || booking.service_type || `Service #${booking.service_id}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <Badge className={getStatusBadge(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Payment Information */}
          {(booking.total_amount || booking.payment_status) && (
            <div className="mt-4 pt-4 border-t border-emerald-200">
              <h4 className="text-md font-medium text-emerald-900 mb-3">Payment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {booking.total_amount && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Amount</p>
                    <p className="text-gray-900 font-semibold">${booking.total_amount} CAD</p>
                  </div>
                )}
                {booking.payment_status && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Payment Status</p>
                    <Badge className={booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {booking.payment_status}
                    </Badge>
                  </div>
                )}
                {booking.payment_method && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Payment Method</p>
                    <p className="text-gray-900">{booking.payment_method}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Management */}
        <div className="bg-white border rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Session Management</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {booking.status === 'pending' ? (
              <>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700" 
                  onClick={() => onStatusChange(booking.id, 'confirmed')} 
                  disabled={updatingStatus === booking.id}
                >
                  {updatingStatus === booking.id ? 'Updating...' : 'Confirm'}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700" 
                  onClick={() => onStatusChange(booking.id, 'cancelled')} 
                  disabled={updatingStatus === booking.id}
                >
                  {updatingStatus === booking.id ? 'Updating...' : 'Cancel'}
                </Button>
              </>
            ) : booking.status === 'confirmed' ? (
              <>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50" 
                  onClick={() => onStatusChange(booking.id, 'completed')} 
                  disabled={updatingStatus === booking.id}
                >
                  {updatingStatus === booking.id ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Completing...
                    </span>
                  ) : (
                    'Mark Complete'
                  )}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-orange-600 hover:bg-orange-700" 
                  onClick={() => onStatusChange(booking.id, 'delayed')} 
                  disabled={updatingStatus === booking.id}
                >
                  {updatingStatus === booking.id ? 'Updating...' : 'Mark Delayed'}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700" 
                  onClick={() => onStatusChange(booking.id, 'cancelled')} 
                  disabled={updatingStatus === booking.id}
                >
                  {updatingStatus === booking.id ? 'Updating...' : 'Cancel'}
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700" 
                onClick={() => onStatusChange(booking.id, 'confirmed')} 
                disabled={updatingStatus === booking.id}
              >
                {updatingStatus === booking.id ? 'Updating...' : 'Reopen'}
              </Button>
            )}
          </div>
        </div>

        {/* Documents Section - Show API-loaded documents for all views */}
        {(documents.length > 0 || documentsLoading) && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              Uploaded Documents {documents.length > 0 && `(${documents.length})`}
            </h3>
            {documentsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="ml-2 text-green-700">Loading documents...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-green-800">{doc.file_name || doc.name}</p>
                          {doc.source === 'intake_form' && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Intake Form</span>
                          )}
                        </div>
                        <p className="text-xs text-green-600">
                          {(doc.file_size || 0) / 1024 / 1024 > 1 
                            ? `${((doc.file_size || 0) / 1024 / 1024).toFixed(2)} MB`
                            : `${Math.round((doc.file_size || 0) / 1024)} KB`
                          } • Uploaded {new Date(doc.uploaded_at || doc.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 px-2 text-xs" 
                        onClick={() => handleViewDocumentInternal({
                          id: doc.id,
                          name: doc.file_name,
                          size: doc.file_size,
                          type: doc.file_type,
                          url: doc.download_url || (doc as any).file_url,
                          uploadedAt: doc.uploaded_at || doc.created_at
                        })}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 px-2 text-xs" 
                        onClick={() => onDownloadDocument({
                          id: doc.id,
                          booking_id: booking.id,
                          name: doc.file_name,
                          size: doc.file_size,
                          type: doc.file_type,
                          url: doc.download_url || (doc as any).file_url
                        })}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

            {/* Session Notes Section */}
            <SessionNotesSection
              bookingId={booking.id}
              currentUserRole={getCurrentUserRole()}
              isClientView={isClientView}
            />
          </>
        )}

        {/* Documents Tab Content */}
        {isClientView && activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Documents for this Session
              </h3>
              <p className="text-gray-600 mb-4">
                View and download all documents associated with your consultation session.
              </p>
              
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900">{doc.file_name || doc.name}</p>
                            {doc.source === 'intake_form' && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Intake Form</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {(doc.file_size || 0) / 1024 / 1024 > 1 
                              ? `${((doc.file_size || 0) / 1024 / 1024).toFixed(2)} MB`
                              : `${Math.round((doc.file_size || 0) / 1024)} KB`
                            } • Uploaded {new Date(doc.uploaded_at || doc.created_at || '').toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewDocumentInternal({
                            id: doc.id,
                            name: doc.file_name,
                            size: doc.file_size,
                            type: doc.file_type,
                            url: doc.download_url || (doc as any).file_url,
                            uploadedAt: doc.uploaded_at || doc.created_at
                          })}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => onDownloadDocument({
                            id: doc.id,
                            booking_id: booking.id,
                            name: doc.file_name,
                            size: doc.file_size,
                            type: doc.file_type,
                            url: (doc as any).file_url || (doc as any).download_url || doc.file_path
                          })}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No documents have been uploaded for this session yet.</p>
                  <Button 
                    onClick={() => setActiveTab('upload')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Intake Information Tab Content */}
        {isClientView && activeTab === 'intake' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Intake Information
              </h3>
              
              {intakeLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-blue-700">Loading detailed intake information...</span>
                </div>
              ) : detailedIntakeData ? (() => {
                console.log('🔍 SessionDetailModal: Displaying detailed intake data:', detailedIntakeData)
                
                // Display Q&A format intake data
                const qaText = formatIntakeAsQA(detailedIntakeData)
                
                return (
                  <div className="space-y-6">
                    {/* Export Buttons */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-md font-medium text-blue-900">Intake Form Data</h4>
                          <p className="text-sm text-blue-700">
                            {intakeService.getStageCompletionPercentage(detailedIntakeData)}% Complete • 
                            Status: <span className="capitalize">{detailedIntakeData.status?.replace('_', ' ')}</span>
                            {detailedIntakeData.completed_at && (
                              <> • Completed: {new Date(detailedIntakeData.completed_at).toLocaleDateString()}</>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const element = document.createElement('a')
                              const file = new Blob([qaText], {type: 'text/plain'})
                              element.href = URL.createObjectURL(file)
                              element.download = `${detailedIntakeData.full_name || 'Client'}_Intake_Form_${new Date().toISOString().split('T')[0]}.txt`
                              document.body.appendChild(element)
                              element.click()
                              document.body.removeChild(element)
                            }}
                          >
                            Export as Text
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => exportToPDF(detailedIntakeData)}
                          >
                            Export as PDF
                          </Button>
                        </div>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${intakeService.getStageCompletionPercentage(detailedIntakeData)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Q&A Format Display */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-96">
                          {qaText}
                        </pre>
                      </div>
                    </div>

                  </div>
                )
              })() : hasIntakeForm ? (() => {
                // Fallback to booking intake data if detailed intake data is not available
                console.log('🔍 SessionDetailModal: Showing fallback intake data from booking')
                return (
                  <div className="space-y-4">
                    {/* Enhanced fallback that tries to display any available intake data */}
                    {Object.keys(parsedIntakeData).filter(key => 
                      typeof parsedIntakeData[key] === 'object' && 
                      parsedIntakeData[key] !== null && 
                      !['formData'].includes(key)
                    ).map(key => {
                      const obj = parsedIntakeData[key]
                      if (!obj || typeof obj !== 'object') return null
                      
                      const entries = Object.entries(obj).filter(([, value]) => value !== null && value !== undefined && value !== '')
                      if (entries.length === 0) return null
                      
                      return (
                        <div key={key} className="bg-white rounded-lg p-4 border border-blue-200">
                          <h5 className="text-sm font-semibold text-gray-800 mb-2">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {entries.map(([subKey, value]) => {
                              if (typeof value === 'object') {
                                return (
                                  <div key={subKey} className="col-span-full">
                                    <p className="text-xs font-medium text-gray-600">{subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                                    <div className="bg-gray-50 rounded p-2 mt-1">
                                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                                    </div>
                                  </div>
                                )
                              }
                              return (
                                <div key={subKey}>
                                  <p className="text-xs font-medium text-gray-600">{subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                                  <p className="text-sm text-gray-900">{Array.isArray(value) ? value.join(', ') : String(value)}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Display formData if it exists */}
                    {parsedIntakeData.formData && (() => {
                      const obj = parsedIntakeData.formData
                      if (!obj || typeof obj !== 'object') return null
                      
                      const entries = Object.entries(obj).filter(([, value]) => value !== null && value !== undefined && value !== '')
                      if (entries.length === 0) return null
                      
                      return (
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h5 className="text-sm font-semibold text-gray-800 mb-2">Form Data</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {entries.map(([subKey, value]) => {
                              if (typeof value === 'object') {
                                return (
                                  <div key={subKey} className="col-span-full">
                                    <p className="text-xs font-medium text-gray-600">{subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                                    <div className="bg-gray-50 rounded p-2 mt-1">
                                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                                    </div>
                                  </div>
                                )
                              }
                              return (
                                <div key={subKey}>
                                  <p className="text-xs font-medium text-gray-600">{subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                                  <p className="text-sm text-gray-900">{Array.isArray(value) ? value.join(', ') : String(value)}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}
                    
                    {/* Basic intake info card */}
                    <div className="bg-white rounded-lg p-6 border border-amber-200">
                      <h4 className="text-md font-medium text-amber-900 mb-4">Basic Intake Information</h4>
                      <div className="bg-amber-50 rounded-lg p-4">
                        <p className="text-amber-800 mb-3">
                          {parsedIntakeData.summary || 'Intake information was provided during booking.'}
                        </p>
                        <p className="text-sm text-amber-600 mb-3">
                          Note: Detailed 12-stage intake form data could not be loaded. This may be because:
                        </p>
                        <ul className="text-xs text-amber-600 list-disc list-inside space-y-1">
                          <li>The client hasn't completed the detailed intake form yet</li>
                          <li>The intake form data is stored in a different format</li>
                          <li>There was an error loading the detailed data</li>
                        </ul>
                      </div>
                      
                    </div>
                  </div>
                )
              })() : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No intake information is available for this session.</p>
                  <p className="text-sm text-gray-400">
                    Intake information is collected during the booking process or separately through our intake form.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Documents Tab Content */}
        {isClientView && activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Documents for this Session
              </h3>
              <p className="text-gray-600 mb-6">
                Upload any documents related to your consultation session. Your consultant will be able to review these documents.
              </p>
              
              <DocumentUpload
                bookingId={booking.id}
                onUploadSuccess={handleDocumentUploadSuccess}
                onUploadError={handleDocumentUploadError}
              />
            </div>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedDocument.name}</h3>
                <p className="text-sm text-gray-600">
                  {selectedDocument.size ? `${(selectedDocument.size / 1024).toFixed(1)} KB` : 'Size unknown'} • 
                  Uploaded {selectedDocument.uploadedAt ? new Date(selectedDocument.uploadedAt).toLocaleDateString() : 'Date unknown'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleOpenInNewTab(selectedDocument)}
                >
                  Open in New Tab
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleDownloadDocumentInternal(selectedDocument)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  onClick={closeDocumentModal} 
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 max-h-[calc(90vh-120px)] overflow-y-auto">
              {(() => {
                // Create safe data URL or use direct URL
                const createSafeDataUrl = (type: string, content: string) => {
                  if (!content || content === 'undefined' || content === 'null') {
                    return null
                  }
                  return `data:${type};base64,${content}`
                }
                
                const imageUrl = selectedDocument.url || createSafeDataUrl(selectedDocument.type, selectedDocument.content)
                
                if (selectedDocument.type?.startsWith('image/')) {
                  if (!imageUrl) {
                    return (
                      <div className="text-center py-8">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Image preview not available.</p>
                        <p className="text-sm text-gray-500 mb-4">The image data may be corrupted or unavailable.</p>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            onClick={() => handleOpenInNewTab(selectedDocument)}
                          >
                            Try Opening in New Tab
                          </Button>
                          <Button 
                            onClick={() => handleDownloadDocumentInternal(selectedDocument)}
                            variant="outline"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download File
                          </Button>
                        </div>
                      </div>
                    )
                  }
                  
                  return (
                    <img 
                      src={imageUrl} 
                      alt={selectedDocument.name}
                      className="max-w-full h-auto rounded shadow-lg"
                      onError={(e) => {
                        console.error('Image failed to load:', e)
                        console.error('Attempted URL:', imageUrl)
                        console.error('Document data:', selectedDocument)
                        e.currentTarget.style.display = 'none'
                        if (e.currentTarget.nextSibling) {
                          (e.currentTarget.nextSibling as HTMLElement).style.display = 'block'
                        }
                      }}
                    />
                  )
                } else if (selectedDocument.type === 'application/pdf') {
                  const pdfUrl = selectedDocument.url || createSafeDataUrl(selectedDocument.type, selectedDocument.content)
                  if (!pdfUrl) {
                    return (
                      <div className="text-center py-8">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">PDF preview not available.</p>
                        <Button onClick={() => handleDownloadDocumentInternal(selectedDocument)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    )
                  }
                  
                  return (
                    <iframe 
                      src={pdfUrl}
                      className="w-full h-[calc(90vh-200px)] border rounded"
                      title={selectedDocument.name}
                    />
                  )
                } else if (selectedDocument.type?.startsWith('text/')) {
                  return (
                    <div className="bg-gray-50 rounded p-4">
                      <pre className="text-sm whitespace-pre-wrap">
                        {selectedDocument.content || 'Content not available'}
                      </pre>
                    </div>
                  )
                } else {
                  return (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">This file type cannot be previewed.</p>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          onClick={() => handleOpenInNewTab(selectedDocument)}
                        >
                          Open in New Tab
                        </Button>
                        <Button 
                          onClick={() => handleDownloadDocumentInternal(selectedDocument)}
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download to View
                        </Button>
                      </div>
                    </div>
                  )
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
