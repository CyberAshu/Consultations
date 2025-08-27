import React from 'react'
import { Button } from '../shared/Button'
import { Badge } from '../ui/Badge'
import { X, FileText, Calendar, Clock, User } from 'lucide-react'
import { Booking } from '../../services/types'
import { bookingService } from '../../services/bookingService'
import { SessionNotesSection } from '../sessionNotes/SessionNotesSection'

interface SessionDetailModalProps {
  show: boolean
  booking: Booking | null
  clientName: string
  onClose: () => void
  onStatusChange: (bookingId: number, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'delayed' | 'rescheduled') => void
  onViewDocument?: (file: any, clientInfo: any) => void // Make optional
  onDownloadDocument: (file: any) => void
  updatingStatus: number | null
  onNotesUpdate: (bookingId: number, notes: string) => void
  isClientView?: boolean // Add optional prop for client view
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

  React.useEffect(() => {
    setNotes(booking?.meeting_notes || '')
  }, [booking])

  if (!show || !booking) return null

  // Parse intake form data if it's a string (JSON)
  let parsedIntakeData = booking.intake_form_data
  if (typeof booking.intake_form_data === 'string') {
    try {
      parsedIntakeData = JSON.parse(booking.intake_form_data)
      console.log('✅ SessionDetailModal: Parsed intake data:', parsedIntakeData)
    } catch (error) {
      console.error('❌ SessionDetailModal: Failed to parse intake form JSON:', error)
      console.log('Raw string data:', booking.intake_form_data)
    }
  }

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
            <p className="text-sm text-gray-600">{clientName} - {booking.service_type || `Service #${booking.service_id}`}</p>
          </div>
          <Button variant="outline" onClick={onClose} size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Client Information Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <p className="text-sm font-medium text-gray-700">Client ID</p>
                <p className="text-gray-900 font-mono text-sm">{booking.client_id}</p>
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
          
          {/* Additional Client Details from Intake Form */}
          {hasIntakeForm && (() => {
            // Helper function to get field value from either root or formData
            const getField = (fieldName: string) => {
              return parsedIntakeData[fieldName] || parsedIntakeData.formData?.[fieldName]
            }
            
            return (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h4 className="text-md font-medium text-blue-900 mb-3">Personal Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getField('fullName') && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Full Name</p>
                      <p className="text-gray-900">{getField('fullName')}</p>
                    </div>
                  )}
                  {getField('email') && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-gray-900">{getField('email')}</p>
                    </div>
                  )}
                  {getField('phone') && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-gray-900">{getField('phone')}</p>
                    </div>
                  )}
                  {getField('dateOfBirth') && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Date of Birth</p>
                      <p className="text-gray-900">{new Date(getField('dateOfBirth')).toLocaleDateString()}</p>
                    </div>
                  )}
                  {getField('nationality') && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Nationality</p>
                      <p className="text-gray-900">{getField('nationality')}</p>
                    </div>
                  )}
                  {getField('currentCountry') && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Current Country</p>
                      <p className="text-gray-900">{getField('currentCountry')}</p>
                    </div>
                  )}
                  {getField('maritalStatus') && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Marital Status</p>
                      <p className="text-gray-900">{getField('maritalStatus')}</p>
                    </div>
                  )}
                  {getField('englishProficiency') && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">English Proficiency</p>
                      <p className="text-gray-900">{getField('englishProficiency')}</p>
                    </div>
                  )}
                  {getField('educationLevel') && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Education Level</p>
                      <p className="text-gray-900">{getField('educationLevel')}</p>
                    </div>
                  )}
                  {getField('workExperience') && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Work Experience</p>
                      <p className="text-gray-900">{getField('workExperience')} years</p>
                    </div>
                  )}
                  {getField('currentJob') && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Current Job</p>
                      <p className="text-gray-900">{getField('currentJob')}</p>
                    </div>
                  )}
                  {getField('immigrationGoal') && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <p className="text-sm font-medium text-gray-700">Immigration Goal</p>
                      <p className="text-gray-900">{getField('immigrationGoal')}</p>
                    </div>
                  )}
                  {getField('immigrationStatus') && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Immigration Status</p>
                      <p className="text-gray-900">{getField('immigrationStatus')}</p>
                    </div>
                  )}
                  {getField('specificQuestions') && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <p className="text-sm font-medium text-gray-700">Specific Questions</p>
                      <p className="text-gray-900">{getField('specificQuestions')}</p>
                    </div>
                  )}
                  {getField('previousApplications') && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <p className="text-sm font-medium text-gray-700">Previous Applications</p>
                      <div className="text-gray-900 grid grid-cols-2 gap-2 mt-1">
                        {Object.entries(getField('previousApplications') as any).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center text-sm">
                            <span className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {value ? 'Yes' : 'No'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
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
                <p className="text-gray-900">{booking.service_type || `Service #${booking.service_id}`}</p>
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

        {/* Documents Section */}
        {hasDocuments && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Uploaded Documents</h3>
              <div className="space-y-2">
                {booking.documents?.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{doc.file_name}</p>
                        <p className="text-xs text-green-600">
                          {(doc.file_size || 0) / 1024 / 1024 > 1 
                            ? `${((doc.file_size || 0) / 1024 / 1024).toFixed(2)} MB`
                            : `${Math.round((doc.file_size || 0) / 1024)} KB`
                          }
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
                          url: (doc as any).file_url || (doc as any).download_url || doc.file_path,
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
                          url: (doc as any).file_url || (doc as any).download_url || doc.file_path
                        })}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        )}

        {/* Session Notes Section */}
        <SessionNotesSection
          bookingId={booking.id}
          currentUserRole={getCurrentUserRole()}
          isClientView={isClientView}
        />

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
      
      {/* Internal Document Viewing Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white p-4 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
            {/* Document Modal Header */}
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedDocument.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>Type: {selectedDocument.type || 'Unknown'}</span>
                  <span>Size: {
                    selectedDocument.size > 1024 * 1024 
                      ? `${(selectedDocument.size / 1024 / 1024).toFixed(2)} MB`
                      : selectedDocument.size > 1024 
                        ? `${Math.round(selectedDocument.size / 1024)} KB`
                        : `${selectedDocument.size} bytes`
                  }</span>
                  {selectedDocument.uploadedAt && (
                    <span>Uploaded: {new Date(selectedDocument.uploadedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleOpenInNewTab(selectedDocument)}
                >
                  Open in New Tab
                </Button>
                <Button size="sm" variant="outline" onClick={closeDocumentModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Document Preview */}
            <div className="bg-gray-50 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
              {selectedDocument.type?.startsWith('image/') && selectedDocument.url ? (
                <img 
                  src={selectedDocument.url} 
                  alt={selectedDocument.name}
                  className="max-w-full max-h-[500px] object-contain rounded shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-center text-gray-500 p-8';
                    errorDiv.innerHTML = `
                      <div class="mb-4">
                        <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <p class="text-lg font-medium mb-2">Unable to load image</p>
                      <p class="text-sm">The image may be corrupted or the URL is invalid.</p>
                    `;
                    (e.target as HTMLImageElement).parentNode?.appendChild(errorDiv);
                  }}
                />
              ) : selectedDocument.type === 'application/pdf' && selectedDocument.url ? (
                <iframe 
                  src={selectedDocument.url}
                  className="w-full h-[600px] rounded border"
                  title={selectedDocument.name}
                  onError={() => {
                    console.error('PDF failed to load:', selectedDocument.url);
                  }}
                />
              ) : selectedDocument.type?.startsWith('text/') && (selectedDocument.content || selectedDocument.url) ? (
                <div className="w-full">
                  <div className="bg-white rounded border p-4 font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                    {selectedDocument.content || 'Loading text content...'}
                  </div>
                  {!selectedDocument.content && selectedDocument.url && (
                    <div className="mt-2 text-center">
                      <a 
                        href={selectedDocument.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View original file
                      </a>
                    </div>
                  )}
                </div>
              ) : selectedDocument.url ? (
                <div className="text-center text-gray-500 p-8">
                  <div className="mb-4">
                    <FileText className="w-16 h-16 mx-auto text-gray-400" />
                  </div>
                  <p className="text-lg font-medium mb-2">Preview not available</p>
                  <p className="text-sm mb-4">This file type cannot be previewed in the browser.</p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      size="sm" 
                      onClick={() => handleOpenInNewTab(selectedDocument)}
                    >
                      Open in New Tab
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onDownloadDocument(selectedDocument)}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 p-8">
                  <div className="mb-4">
                    <X className="w-16 h-16 mx-auto text-gray-400" />
                  </div>
                  <p className="text-lg font-medium mb-2">File not available</p>
                  <p className="text-sm">No file URL or content available for preview.</p>
                </div>
              )}
            </div>
            
            {/* Document Actions */}
            <div className="mt-4 flex justify-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onDownloadDocument(selectedDocument)}
              >
                Download
              </Button>
              <Button size="sm" variant="outline" onClick={closeDocumentModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
