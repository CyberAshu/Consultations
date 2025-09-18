import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '../shared/Button'
import { X, FileText, Upload, Download, Eye, User } from 'lucide-react'
import { Booking } from '../../services/types'
import { bookingService } from '../../services/bookingService'
import { intakeService, IntakeData } from '../../services/intakeService'
import { SessionNotesSection } from '../sessionNotes/SessionNotesSection'
import { DocumentUpload } from '../shared/DocumentUpload'

// Import new components
import { ClientInformationSection } from './components/ClientInformationSection'
import { SessionInformationSection } from './components/SessionInformationSection'
import { StatusManagementSection } from './components/StatusManagementSection'
import { DocumentsSection } from './components/DocumentsSection'

// Import utilities
import { parseIntakeData, formatIntakeAsQA, exportAsText, exportToPDF } from './utils/intakeUtils'
import { handleOpenInNewTab, handleDownloadDocument, enhanceFileObject } from './utils/documentUtils'

// Enhanced booking interface
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
  onViewDocument?: (file: any, clientInfo: any) => void
  onDownloadDocument: (file: any) => void
  updatingStatus: number | null
  onNotesUpdate: (bookingId: number, notes: string) => void
  isClientView?: boolean
  onDocumentUploadSuccess?: () => void
}

export function SessionDetailModal({
  show,
  booking,
  clientName,
  onClose,
  onStatusChange,
  onViewDocument: _onViewDocument,
  onDownloadDocument,
  updatingStatus,
  onNotesUpdate: _onNotesUpdate,
  isClientView = false,
  onDocumentUploadSuccess
}: SessionDetailModalProps) {
  const [activeTab, setActiveTab] = useState(isClientView ? 'overview' : 'overview')
  const [documents, setDocuments] = useState<any[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [detailedIntakeData, setDetailedIntakeData] = useState<IntakeData | null>(null)
  const [intakeLoading, setIntakeLoading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [showDocumentModal, setShowDocumentModal] = useState(false)

  const parsedIntakeData = parseIntakeData(booking?.intake_form_data)

  useEffect(() => {
    if (booking) {
      loadBookingDocuments()
      loadDetailedIntakeData()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking, parsedIntakeData])

  const loadBookingDocuments = useCallback(async () => {
    if (!booking) return
    
    try {
      setDocumentsLoading(true)
      const documentsData = await bookingService.getBookingDocuments(booking.id)
      
      let allDocuments = documentsData.documents || []
      
      // Check for intake form documents
      let intakeFiles = null
      if (parsedIntakeData?.uploadedFiles && Array.isArray(parsedIntakeData.uploadedFiles)) {
        intakeFiles = parsedIntakeData.uploadedFiles
      } else if (parsedIntakeData?.uploaded_files && Array.isArray(parsedIntakeData.uploaded_files)) {
        intakeFiles = parsedIntakeData.uploaded_files
      }
      
      if (intakeFiles && intakeFiles.length > 0) {
        const intakeDocuments = intakeFiles.map((file: any, index: number) => ({
          id: file.id || `intake_${index}`,
          file_name: file.name || file.fileName || file.file_name || `Intake Document ${index + 1}`,
          file_size: file.size || file.fileSize || file.file_size || 0,
          file_type: file.type || file.fileType || file.file_type || 'application/octet-stream',
          download_url: file.url || file.dataUrl || file.base64Content || file.download_url || null,
          uploaded_at: file.uploadedAt || file.uploaded_at || booking.created_at,
          source: 'intake_form',
          is_intake_file: true,
          ...file
        }))
        
        allDocuments = [...allDocuments, ...intakeDocuments]
      }
      
      setDocuments(allDocuments)
    } catch (error) {
      console.error('Error loading documents:', error)
      setDocuments(booking?.documents || [])
    } finally {
      setDocumentsLoading(false)
    }
  }, [booking, parsedIntakeData])

  const loadDetailedIntakeData = useCallback(async () => {
    if (!booking?.client_id) return
    
    try {
      setIntakeLoading(true)
      
      // Check if we have detailed intake data in booking
      if (parsedIntakeData?.personal_info || parsedIntakeData?.formatted_text || parsedIntakeData?.completion_status) {
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
          
          // Personal Information
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
          language_test_taken: parsedIntakeData.education_work?.language_test_taken,
          test_type: parsedIntakeData.education_work?.test_type as any,
          years_experience: parsedIntakeData.education_work?.years_experience,
          
          // Immigration Goals
          program_interest: parsedIntakeData.immigration_profile?.program_interest,
          province_interest: parsedIntakeData.immigration_profile?.province_interest,
          urgency: parsedIntakeData.immigration_profile?.urgency?.toLowerCase() as any,
          target_arrival: parsedIntakeData.goals_timeline?.target_arrival || parsedIntakeData.immigration_profile?.target_arrival,
          docs_ready: parsedIntakeData.goals_timeline?.docs_ready,
          
          formatted_text: parsedIntakeData.formatted_text
        } as IntakeData
        
        setDetailedIntakeData(detailedIntake)
      }
    } catch (error: any) {
      console.error('Error loading detailed intake data:', error)
      setDetailedIntakeData(null)
    } finally {
      setIntakeLoading(false)
    }
  }, [booking, parsedIntakeData])

  const handleViewDocumentInternal = (file: any) => {
    const enhancedFile = enhanceFileObject(file)
    setSelectedDocument(enhancedFile)
    setShowDocumentModal(true)
  }

  const closeDocumentModal = () => {
    setShowDocumentModal(false)
    setSelectedDocument(null)
  }

  const handleDocumentUploadSuccess = (uploadedDocument: any) => {
    loadBookingDocuments()
    if (onDocumentUploadSuccess) {
      onDocumentUploadSuccess()
    }
  }

  const handleDocumentUploadError = (error: string) => {
    console.error('Document upload failed:', error)
    alert(`Document upload failed: ${error}`)
  }

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
    return isClientView ? 'client' : 'rcic'
  }

  // Tab configuration for client view
  const clientTabs = [
    { id: 'overview', label: 'Session Overview', icon: <Eye className="h-4 w-4" /> },
    { id: 'intake', label: 'Intake Information', icon: <User className="h-4 w-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
    { id: 'upload', label: 'Upload Documents', icon: <Upload className="h-4 w-4" /> }
  ]

  if (!show || !booking) return null

  // const hasIntakeForm = parsedIntakeData // Unused variable

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
            <ClientInformationSection 
              clientName={clientName}
              booking={booking}
              parsedIntakeData={parsedIntakeData}
            />

            <SessionInformationSection booking={booking} />

            <StatusManagementSection 
              booking={booking}
              onStatusChange={onStatusChange}
              updatingStatus={updatingStatus}
            />

            <DocumentsSection 
              documents={documents}
              documentsLoading={documentsLoading}
              onViewDocument={handleViewDocumentInternal}
              onDownloadDocument={onDownloadDocument}
              booking={booking}
            />

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
                          onClick={() => handleViewDocumentInternal(doc)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => onDownloadDocument(doc)}
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
              ) : detailedIntakeData ? (
                <div className="space-y-6">
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
                          onClick={() => exportAsText(detailedIntakeData)}
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

                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-96">
                        {formatIntakeAsQA(detailedIntakeData)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No detailed intake information available.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Documents Tab Content */}
        {isClientView && activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Additional Documents
              </h3>
              <p className="text-gray-600 mb-6">
                Upload any additional documents for your consultation session.
              </p>
              
              <DocumentUpload
                bookingId={booking.id}
                onUploadSuccess={handleDocumentUploadSuccess}
                onUploadError={handleDocumentUploadError}
                maxFileSize={10 * 1024 * 1024} // 10MB
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Document Modal (if needed) */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedDocument.name}</h3>
              <Button variant="outline" onClick={closeDocumentModal} size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center">
              <p className="text-gray-500 mb-4">Document preview functionality would go here</p>
              <Button 
                onClick={() => handleOpenInNewTab(selectedDocument)}
                className="mr-2"
              >
                Open in New Tab
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleDownloadDocument(selectedDocument)}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}