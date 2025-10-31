import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../../components/common/Button'
import { Card, CardContent } from '../../../../components/common/Card'
import { Badge } from '../../../../components/common/Badge'
import { ToastContainer, useToasts } from '../../../../components/common/Toast'
import { Calendar, Clock, User, FileText, Settings, DollarSign, LogOut, ArrowLeft, Bell, Award, Wrench, X, Wifi, WifiOff, Edit2 } from 'lucide-react'
import { bookingService } from '../../../../api/services/booking.service'
import { consultantService } from '../../../../api/services/consultant.service'
import { serviceTemplateService } from '../../../../api/services/serviceTemplate.service'
import { useAuth } from '../../../auth/hooks/useAuth'
import { Booking, Consultant, ConsultantServiceInDB, ServiceTemplate } from '../../../../types/service.types'
import { SessionDetailModal } from '../components/SessionDetailModal/SessionDetailModal'
import { useRealtimeBookingUpdates } from '../../../booking/hooks/useRealtimeBookingUpdates'
import { ServicesTableView } from '../components/ServicesTableView'
import { RCICAvailabilityManager } from '../components/RCICAvailabilityManager'
import { RCICBookingsCalendar } from '../components/RCICBookingsCalendar'

export function RCICDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [initialBookingsLoaded, setInitialBookingsLoaded] = useState(false)
  const [refreshingBookings, setRefreshingBookings] = useState(false)
  const [consultant, setConsultant] = useState<Consultant | null>(null)
  const [services, setServices] = useState<ConsultantServiceInDB[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [servicesError, setServicesError] = useState<string | null>(null)
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templatesError, setTemplatesError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newService, setNewService] = useState({
    service_template_id: 0,
    name: '',
    duration: 30, // Duration in minutes as number
    price: 0,
    description: '',
    is_active: true,
  })
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null)
  const [editService, setEditService] = useState({
    name: '',
    duration: 30, // Duration in minutes as number
    price: 0,
    description: '',
    is_active: true,
  })
  // Client names mapping
  const [clientNames, setClientNames] = useState<{[key: string]: string}>({})
  
  // Document management
  const [bookingDocuments, setBookingDocuments] = useState<{[key: number]: any[]}>({})
  const [documentLoading, setDocumentLoading] = useState<{[key: number]: boolean}>({})
  
  // Modal states
  const [showIntakeModal, setShowIntakeModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedIntakeData, setSelectedIntakeData] = useState<any>(null)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  // Status update states
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null)
  // Session detail modal states
  const [showSessionDetailModal, setShowSessionDetailModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  // Profile save state
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaveMessage, setProfileSaveMessage] = useState<string | null>(null)

  const handleProfileInputChange = (field: keyof typeof profileForm, value: any) => {
    setProfileForm(prev => ({ ...prev, [field]: value }))
    setProfileSaveMessage(null)
  }

  const handleProfileSave = async () => {
    if (!consultant) return
    try {
      setSavingProfile(true)
      setProfileSaveMessage(null)
      // Prepare payload with arrays normalized
      const payload: any = { ...profileForm }
      if (Array.isArray(payload.languages)) {
        payload.languages = payload.languages
      } else if (typeof payload.languages === 'string') {
        payload.languages = payload.languages.split(',').map((s: string) => s.trim()).filter(Boolean)
      }
      if (Array.isArray(payload.specialties)) {
        payload.specialties = payload.specialties
      } else if (typeof payload.specialties === 'string') {
        payload.specialties = payload.specialties.split(',').map((s: string) => s.trim()).filter(Boolean)
      }
      // Remove auth-only and unrelated fields
      delete payload.role
      delete payload.created_at
      delete payload.updated_at
      delete payload.full_name
      delete payload.email
      delete payload.phone
      delete payload.email_verified
      // RCIC number should not be editable via UI/save
      delete payload.rcic_number
      const updated = await consultantService.updateConsultantProfile(consultant.id, payload)
      setConsultant(prev => (prev ? { ...prev, ...updated } as any : prev))
      setProfileSaveMessage('Profile updated successfully')
    } catch (e: any) {
      const apiDetail = e?.response?.data?.detail
      if (Array.isArray(apiDetail)) {
        const msg = apiDetail.map((d: any) => d?.msg || JSON.stringify(d)).join('; ')
        setProfileSaveMessage(msg)
      } else if (typeof apiDetail === 'string') {
        setProfileSaveMessage(apiDetail)
      } else {
        setProfileSaveMessage(e?.message || 'Failed to update profile')
      }
    } finally {
      setSavingProfile(false)
    }
  }

  const handleProfileImageUpload = async (file: File) => {
    try {
      setSavingProfile(true)
      setProfileSaveMessage(null)
      const res = await consultantService.uploadProfileImage(file)
      setProfileForm(prev => ({ ...prev, profile_image_url: res.url }))
      if (consultant) {
        const updated = await consultantService.updateConsultantProfile(consultant.id, { profile_image_url: res.url })
        setConsultant(prev => (prev ? { ...prev, ...updated, profile_image_url: res.url } as any : prev))
        
        // Force refresh consultant data to ensure updated profile image appears everywhere
        setTimeout(async () => {
          try {
            const refreshedConsultants = await consultantService.getConsultants()
            const refreshedConsultant = refreshedConsultants.find(c => c.id === consultant.id)
            if (refreshedConsultant) {
              setConsultant(refreshedConsultant)
              setProfileForm(prev => ({ ...prev, profile_image_url: refreshedConsultant.profile_image_url || '' }))
            }
          } catch (refreshError) {
            console.warn('Failed to refresh consultant data:', refreshError)
          }
        }, 1000) // Small delay to ensure backend has processed the update
      }
      setProfileSaveMessage('Profile image updated successfully! Refreshing data...')
    } catch (e: any) {
      setProfileSaveMessage(e?.message || 'Image upload failed')
    } finally {
      setSavingProfile(false)
    }
  }
  // Profile form state with extended Supabase auth fields
  const [profileForm, setProfileForm] = useState({
    // Basic Profile
    full_name: '',
    name: '',
    email: '',
    bio: '',
    languages: [] as string[] | string,
    specialties: [] as string[] | string,
    location: '',
    experience: '',
    rcic_number: '',
    timezone: 'America/Toronto',
    calendly_url: '',
    profile_image_url: '',
    // Supabase Auth fields
    phone: '',
    email_verified: false,
    role: 'rcic' as 'client' | 'rcic' | 'admin',
    created_at: '',
    updated_at: ''
  })

  // Fetch consultant details first
  useEffect(() => {
    if (!user) return;

    const fetchConsultantDetails = async () => {
      try {
        // First, get all consultants and find the one matching current user's user_id
        const allConsultants = await consultantService.getConsultants();
        
        const currentConsultant = allConsultants.find(consultant => consultant.user_id === user.id);
        
        if (currentConsultant) {
          setConsultant(currentConsultant);
          
          // Set comprehensive profile form with Supabase auth data
          setProfileForm({
            // Basic Profile Fields
            full_name: user.full_name || '',
            name: currentConsultant.name,
            email: user.email || '',
            bio: currentConsultant.bio || '',
            languages: currentConsultant.languages || [],
            specialties: currentConsultant.specialties || [],
            location: currentConsultant.location || '',
            experience: currentConsultant.experience || '',
            rcic_number: currentConsultant.rcic_number || '',
            timezone: currentConsultant.timezone || 'America/Toronto',
            calendly_url: currentConsultant.calendly_url || '',
            profile_image_url: currentConsultant.profile_image_url || '',
            // Supabase Auth Fields
            phone: '',
            email_verified: user.email_verified,
            role: user.role,
            created_at: '',
            updated_at: ''
          });

        } else {
          console.warn('No consultant record found for current user');
          // Set default values from user data if no consultant record exists
          setProfileForm(prev => ({
            ...prev,
            name: user.full_name || 'RCIC User'
          }));
        }
      } catch (error) {
        console.error('Failed to fetch consultant details:', error);
        // If fetching fails, set some default values from user data
        if (user) {
          setProfileForm(prev => ({
            ...prev,
            name: user.full_name || 'RCIC User'
          }));
        }
      }
    };

    fetchConsultantDetails();
  }, [user]);

  // Add this function to fetch documents for each booking
  const fetchBookingDocuments = async (bookingId: number) => {
    try {
      setDocumentLoading(prev => ({...prev, [bookingId]: true}))
      const response = await bookingService.getBookingDocuments(bookingId)
      
      setBookingDocuments(prev => ({
        ...prev, 
        [bookingId]: response.documents || []
      }))
    } catch (error) {
      console.error(`❌ Failed to fetch documents for booking ${bookingId}:`, error)
      setBookingDocuments(prev => ({...prev, [bookingId]: []}))
    } finally {
      setDocumentLoading(prev => ({...prev, [bookingId]: false}))
    }
  }

  // Centralized bookings fetcher with optional spinner
  const didFetchRef = useRef(false)
  const fetchBookings = async (showSpinner: boolean) => {
    try {
      if (showSpinner && !initialBookingsLoaded) setLoading(true); else setRefreshingBookings(true)
      const data = await bookingService.getBookings()
      const filteredBookings = consultant ? data.filter(b => b.consultant_id === consultant.id) : []
      setBookings(filteredBookings)
      const clientIds = filteredBookings.map(b => b.client_id).filter((id, i, arr) => arr.indexOf(id) === i)
      await fetchClientNames(clientIds)
      
      // FETCH DOCUMENTS FOR EACH BOOKING
      for (const booking of filteredBookings) {
        // Don't await - fetch in parallel to not slow down the UI
        fetchBookingDocuments(booking.id).catch(err => {
          console.warn(`Failed to fetch documents for booking ${booking.id}:`, err)
        })
      }
      
      } catch (error) {
      console.error('Failed to fetch bookings:', error)
      setBookings([])
      } finally {
      if (showSpinner && !initialBookingsLoaded) {
        setLoading(false)
        setInitialBookingsLoaded(true)
      } else {
        setRefreshingBookings(false)
      }
    }
  }

  // Fetch bookings after consultant data is loaded (without UI flicker on refresh)
  useEffect(() => {
    if (!consultant) return
    // Avoid React StrictMode double-fetch flicker
    if (didFetchRef.current) {
      fetchBookings(false)
      return
    }
    didFetchRef.current = true
    fetchBookings(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultant])

  const handleLogout = async () => {
    try {
      // Clear all auth data properly
      localStorage.removeItem('user')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('token_expires_at')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Navigate to login even if logout fails
      navigate('/login')
    }
  }



  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <User className="h-4 w-4" /> },
    { id: 'sessions', label: 'My Sessions', icon: <Calendar className="h-4 w-4" /> },
    { id: 'availability', label: 'Availability', icon: <Clock className="h-4 w-4" /> },
    { id: 'services', label: 'Services', icon: <Wrench className="h-4 w-4" /> },
    { id: 'profile', label: 'Profile', icon: <Settings className="h-4 w-4" /> },
    { id: 'payments', label: 'Payments', icon: <DollarSign className="h-4 w-4" /> }
  ]

  // Compute today's appointments from real booking data
  const today = new Date().toDateString()
  const todayAppointments = bookings
    .filter(booking => new Date(booking.booking_date || booking.scheduled_date || '').toDateString() === today)
    .map(booking => ({
      id: booking.id,
      client: clientNames[booking.client_id] || `Client ${booking.client_id.slice(0, 8)}...${booking.client_id.slice(-4)}`,
      time: new Date(booking.booking_date || booking.scheduled_date || '').toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      service: booking.service_type || `Service #${booking.service_id}`,
      status: booking.status === 'confirmed' ? 'upcoming' : booking.status
    }))

  // Time-based session categorization logic
  const categorizeBookingsByTime = (bookings: Booking[]) => {
    const now = new Date()
    const categories = {
      upcoming: [] as Booking[],
      ongoing: [] as Booking[],
      completed: [] as Booking[],
      past: [] as Booking[]
    }

    bookings.forEach(booking => {
      const bookingTime = new Date(booking.booking_date || booking.scheduled_date || '')
      // Fallback to 60 minutes if duration_minutes is missing
      const durationMinutes = booking.duration_minutes || 60
      const sessionEndTime = new Date(bookingTime.getTime() + (durationMinutes * 60 * 1000))
      
      // Categorize based on time and status
      if (booking.status === 'completed') {
        categories.completed.push(booking)
      } else if (booking.status === 'cancelled') {
        categories.past.push(booking)
      } else if (bookingTime > now) {
        // Future sessions
        categories.upcoming.push(booking)
      } else if (bookingTime <= now && sessionEndTime > now) {
        // Currently happening
        categories.ongoing.push(booking)
      } else {
        // Past sessions (time has passed but not completed)
        categories.past.push(booking)
      }
    })

    // Sort each category by date
    Object.keys(categories).forEach(key => {
      categories[key as keyof typeof categories].sort((a, b) => {
        const dateA = new Date(a.booking_date || a.scheduled_date || '')
        const dateB = new Date(b.booking_date || b.scheduled_date || '')
        return key === 'upcoming' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
      })
    })

    return categories
  }

  // Categorized sessions
  const categorizedSessions = categorizeBookingsByTime(bookings)

  useEffect(() => {
    if (!consultant) return;
    const fetchServices = async () => {
      try {
        setServicesLoading(true)
        setServicesError(null)
        const list = await consultantService.getConsultantServices(consultant.id)
        setServices(list)
      } catch (error: any) {
        setServicesError(error?.message || 'Failed to load services')
        setServices([])
      } finally {
        setServicesLoading(false)
      }
    }
    fetchServices()
  }, [consultant])

  // Fetch service templates on component mount
  useEffect(() => {
    const fetchServiceTemplates = async () => {
      try {
        setTemplatesLoading(true)
        setTemplatesError(null)
        const templates = await serviceTemplateService.getServiceTemplates()
        setServiceTemplates(templates)
      } catch (error: any) {
        setTemplatesError(error?.message || 'Failed to load service templates')
        setServiceTemplates([])
      } finally {
        setTemplatesLoading(false)
      }
    }
    fetchServiceTemplates()
  }, [])

  const resetNewService = () => {
    setNewService({ service_template_id: 0, name: '', duration: 30, price: 0, description: '', is_active: true })
  }

  const handleAddService = async () => {
    if (!consultant) return
    try {
      setServicesLoading(true)
      const created = await consultantService.createConsultantService(consultant.id, newService)
      setServices(prev => [created, ...prev])
      resetNewService()
      setIsAdding(false)
    } catch (error: any) {
      setServicesError(error?.message || 'Failed to create service')
    } finally {
      setServicesLoading(false)
    }
  }

  const startEditService = (svc: ConsultantServiceInDB) => {
    setEditingServiceId(svc.id)
    setEditService({
      name: svc.name,
      duration: svc.duration,
      price: svc.price,
      description: svc.description || '',
      is_active: svc.is_active,
    })
  }

  const cancelEditService = () => {
    setEditingServiceId(null)
  }

  const handleUpdateService = async (serviceId: number) => {
    if (!consultant) return
    try {
      setServicesLoading(true)
      const updated = await consultantService.updateConsultantService(consultant.id, serviceId, editService)
      setServices(prev => prev.map(s => (s.id === serviceId ? updated : s)))
      setEditingServiceId(null)
    } catch (error: any) {
      setServicesError(error?.message || 'Failed to update service')
    } finally {
      setServicesLoading(false)
    }
  }

  const handleToggleService = async (serviceId: number) => {
    if (!consultant) return
    try {
      setServicesLoading(true)
      const result = await consultantService.toggleConsultantService(consultant.id, serviceId)
      // Update the service in the list with new status
      setServices(prev => prev.map(s => 
        s.id === serviceId ? { ...s, is_active: result.is_active } : s
      ))
      // Show success message
      alert(result.message)
    } catch (error: any) {
      setServicesError(error?.message || 'Failed to toggle service status')
    } finally {
      setServicesLoading(false)
    }
  }

  // Fetch client names for display
  const fetchClientNames = async (clientIds: string[]) => {
    if (clientIds.length === 0) return
    
    try {
      // Create a mapping with more readable client names
      const namesMap: {[key: string]: string} = {}
      
      clientIds.forEach(id => {
        // Create a more readable client identifier
        const shortId = id.slice(0, 8)
        const lastFour = id.slice(-4)
        namesMap[id] = `Client ${shortId}...${lastFour}`
      })
      
      setClientNames(namesMap)
    } catch (error) {
      console.error('Failed to fetch client names:', error)
      // Fallback to client IDs
      const namesMap: {[key: string]: string} = {}
      clientIds.forEach(id => {
        const shortId = id.slice(0, 8)
        const lastFour = id.slice(-4)
        namesMap[id] = `Client ${shortId}...${lastFour}`
      })
      setClientNames(namesMap)
    } finally {
      // setClientNamesLoading(false) // This line was removed as per the edit hint
    }
  }

  // Handle viewing intake form
  const handleViewIntakeForm = (intakeData: any, clientInfo: any) => {
    if (!intakeData) {
      alert('No intake form data available')
      return
    }
    
    // Debug logging to understand the data structure
    console.log('🔍 Raw intake data:', intakeData)
    console.log('🔍 Intake data type:', typeof intakeData)
    console.log('🔍 Intake data keys:', Object.keys(intakeData))
    console.log('🔍 Intake data JSON string:', JSON.stringify(intakeData, null, 2))
    
    // Check if data is already parsed object or needs parsing
    let parsedIntakeData = intakeData
    
    if (typeof intakeData === 'string') {
      try {
        parsedIntakeData = JSON.parse(intakeData)
        console.log('✅ Parsed intake data from string:', parsedIntakeData)
      } catch (error) {
        console.error('❌ Failed to parse intake form JSON:', error)
        console.log('Raw string data:', intakeData)
      }
    } else if (typeof intakeData === 'object' && intakeData !== null) {
      // Check if this object has nested JSON strings that need parsing
      console.log('🔍 Processing object intake data...')
      Object.keys(intakeData).forEach(key => {
        const value = intakeData[key]
        console.log(`🔍 Field '${key}':`, typeof value, value)
        
        // If value is a string that looks like JSON, try to parse it
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))  ) {
          try {
            const parsed = JSON.parse(value)
            console.log(`🔧 Parsed nested JSON for '${key}':`, parsed)
            parsedIntakeData[key] = parsed
          } catch (e) {
            console.log(`⚠️ Could not parse '${key}' as JSON:`, e)
          }
        }
      })
      
      console.log('✅ Final processed intake data:', parsedIntakeData)
    }
    
    setSelectedIntakeData(parsedIntakeData)
    setSelectedClient(clientInfo)
    setShowIntakeModal(true)
  }

  // Handle viewing document
  const handleViewDocument = (file: any, clientInfo: any) => {
    if (!file) {
      alert('No document data available')
      return
    }
    
    console.log('Original file object:', file) // Debug log
    
    // Enhance the file object with additional properties for preview
    // Handle both intake form files and regular booking documents
    const enhancedFile = {
      ...file,
      // Handle different possible name fields
      name: file.name || file.file_name || 'Unknown File',
      // Handle different possible content fields
      content: file.content || file.file_content || file.data || file.base64Content,
      // Handle different possible URL fields
      url: file.url || file.file_url || file.download_url || file.file_path || file.uploadedFileUrl,
      // Handle different possible type fields
      type: file.type || file.file_type || file.mime_type || file.contentType || 'application/octet-stream',
      // Handle different possible size fields
      size: file.size || file.file_size || file.fileSize || 0,
      // Handle different possible upload date fields
      uploadedAt: file.uploadedAt || file.uploaded_at || file.createdAt || file.created_at || new Date().toISOString()
    }
    
    console.log('Enhanced file object:', enhancedFile) // Debug log
    
    setSelectedDocument(enhancedFile)
    setSelectedClient(clientInfo)
    setShowDocumentModal(true)
  }

  // Handle downloading document
  const handleDownloadDocument = async (file: any) => {
    if (!file) {
      alert('No document data available')
      return
    }
    
    try {
      // If this is a booking document (has booking_id and document id), use the API
      if (file.booking_id && (file.id || file.document_id)) {
        const documentId = file.id || file.document_id
        const downloadData = await bookingService.getDocumentDownloadUrl(file.booking_id, documentId)
        
        if (downloadData.download_url) {
          // Force download by fetching the file and creating a blob
          const response = await fetch(downloadData.download_url)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = downloadData.file_name || file.name || 'document'
          // DON'T set target='_blank' for downloads
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          return
        }
      }
      
      // If we have a direct URL, fetch it and force download
      if (file.url || file.file_url || file.download_url) {
        try {
          const fileUrl = file.url || file.file_url || file.download_url
          const response = await fetch(fileUrl)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = file.name || file.file_name || 'document'
          // DON'T set target='_blank' for downloads
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          return
        } catch (fetchError) {
          console.warn('Failed to fetch file for download, trying direct link:', fetchError)
          // Fallback to direct link with download attribute
          const link = document.createElement('a')
          link.href = file.url || file.file_url || file.download_url
          link.download = file.name || file.file_name || 'document'
          // DON'T set target='_blank' for downloads
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
          blob = new Blob([byteArray], { type: file.type || file.file_type || 'application/octet-stream' })
        } else {
          blob = new Blob([content], { type: file.type || file.file_type || 'application/octet-stream' })
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

  // Close modals
  const closeIntakeModal = () => {
    setShowIntakeModal(false)
    setSelectedIntakeData(null)
    setSelectedClient(null)
  }

  const closeDocumentModal = () => {
    setShowDocumentModal(false)
    setSelectedDocument(null)
    setSelectedClient(null)
  }

  // Handle opening file in new tab
  const handleOpenInNewTab = (file: any) => {
    if (!file) return
    
    const fileUrl = file.url || file.file_url || file.download_url || file.file_path || file.uploadedFileUrl
    
    if (fileUrl) {
      // For images and PDFs, open in new tab
      if (file.type?.startsWith('image/') || file.type === 'application/pdf') {
        window.open(fileUrl, '_blank')
      } else {
        // For other file types, try to download or show message
        if (file.type?.startsWith('text/')) {
          // For text files, we can show content in modal
          alert('Text file content is already displayed in the preview above.')
        } else {
          alert('This file type cannot be opened in a new tab. Please download it to view.')
        }
      }
    } else if (file.content || file.file_content || file.data) {
      try {
        const blob = new Blob([file.content || file.file_content || file.data], { 
          type: file.type || 'application/octet-stream' 
        })
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
      } catch (err) {
        alert('Unable to open file preview. Please download the file to view.')
      }
    } else {
      alert('File URL not available. This upload likely only saved metadata without a downloadable link.')
    }
  }

  const handleStatusChange = async (bookingId: number, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'delayed' | 'rescheduled') => {
    if (updatingStatus === bookingId) return
    try {
      setUpdatingStatus(bookingId)
      setStatusUpdateError(null)
      const updated = await bookingService.updateBooking(bookingId, { status: newStatus } as any)
      setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status: updated.status } : b)))
      fetchBookings(false)
    } catch (err: any) {
      setStatusUpdateError(err?.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleStartOrJoin = async (booking: Booking) => {
    try {
      const hasRoom = Boolean((booking as any).meeting_url || (booking as any).meeting_link)
      if (!hasRoom) {
        const updated = await bookingService.createRoom(booking.id)
        const url = (updated as any).meeting_url || (updated as any).meeting_link
        if (url) {
          // Update local state with meeting_url
          setBookings(prev => prev.map(b => (b.id === booking.id ? { ...b, meeting_url: (updated as any).meeting_url } as any : b)))
          window.open(url, '_blank')
        }
      } else {
        const url = (booking as any).meeting_url || (booking as any).meeting_link
        window.open(url, '_blank')
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to start/join session')
    }
  }

  // Get status badge styling
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

  // Handle session detail modal
  const handleViewSessionDetail = (booking: Booking) => {
    // 🔥 KEY FIX: Add fetched documents to booking object
    const bookingWithDocuments = {
      ...booking,
      documents: bookingDocuments[booking.id] || []
    }
    
    setSelectedSession(bookingWithDocuments)
    setShowSessionDetailModal(true)
  }

  const closeSessionDetailModal = () => {
    setShowSessionDetailModal(false)
    setSelectedSession(null)
  }

  // Initialize toast notifications
  const toasts = useToasts()

  // Handle booking status updates from real-time events
  const handleBookingUpdate = useCallback((bookingId: number, newStatus: string) => {
    // Validate status before updating
    const validStatuses: Booking['status'][] = ['pending', 'confirmed', 'completed', 'cancelled', 'delayed', 'rescheduled']
    const typedStatus = validStatuses.includes(newStatus as Booking['status']) 
      ? (newStatus as Booking['status']) 
      : 'pending' // fallback to pending if invalid status
    
    // Find the booking that was updated
    const updatedBooking = bookings.find(b => b.id === bookingId)
    const oldStatus = updatedBooking?.status || 'pending'

    // Update the bookings array
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: typedStatus }
          : booking
      )
    )

    // Show toast notification for RCIC
    toasts.bookingStatusUpdate(bookingId, oldStatus, newStatus)
  }, [bookings, toasts])

  // Handle real-time connection errors
  const handleRealtimeError = useCallback((error: string) => {
    toasts.error('Connection Issue', error, {
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    })
  }, [toasts])

  // Set up real-time updates for booking status changes
  const { isConnected, connectionType, reconnect } = useRealtimeBookingUpdates(bookings, {
    onBookingUpdate: handleBookingUpdate,
    onError: handleRealtimeError,
    enabled: true, // ✅ ENABLED: Real-time booking status updates for RCICs
    fallbackToPolling: true,
    pollingInterval: 30000 // Poll every 30 seconds as fallback
  })

  // Connection status tracking
  useEffect(() => {
    // Track connection status for debugging if needed
  }, [isConnected, connectionType, bookings.length])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Website</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      RCIC Dashboard
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">Welcome back, {consultant?.name || user?.full_name || 'User'}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Connection Status Indicator */}
                <div 
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    isConnected 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                  title={`Real-time updates: ${isConnected ? 'Connected' : 'Connecting...'} (${connectionType || 'none'})`}
                >
                  {isConnected ? (
                    <Wifi className="h-3 w-3" />
                  ) : (
                    <WifiOff className="h-3 w-3 animate-pulse" />
                  )}
                  <span className="hidden sm:inline">
                    {isConnected ? 'Live' : 'Sync...'}
                  </span>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-white border-gray-300 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-0 sm:space-x-2 overflow-x-auto scrollbar-hide pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 sm:py-4 px-2 sm:px-4 inline-flex items-center gap-1 sm:gap-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 min-w-0 flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="flex-shrink-0">{tab.icon}</span>
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden text-xs truncate">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {!initialBookingsLoaded ? (
              <Card className="bg-white shadow-sm border-gray-200">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-500">Loading dashboard...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Key Metrics Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <Card className="bg-white shadow-sm border-gray-200">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-600">Upcoming</p>
                          <p className="text-2xl font-bold text-blue-700">{categorizedSessions.upcoming.length}</p>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        {categorizedSessions.upcoming.filter(b => new Date(b.booking_date || b.scheduled_date || '').toDateString() === new Date().toDateString()).length} today
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-sm border-gray-200">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <div className="h-5 w-5 bg-orange-500 rounded-full animate-pulse" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-orange-600">Live Now</p>
                          <p className="text-2xl font-bold text-orange-700">{categorizedSessions.ongoing.length}</p>
                        </div>
                      </div>
                      <p className="text-xs text-orange-600 mt-2">Active sessions</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-sm border-gray-200">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <div className="h-5 w-5 bg-green-500 rounded-full" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-600">Completed</p>
                          <p className="text-2xl font-bold text-green-700">{categorizedSessions.completed.length}</p>
                        </div>
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        {categorizedSessions.completed.filter(b => Date.now() - new Date(b.booking_date || b.scheduled_date || '').getTime() < 7 * 24 * 60 * 60 * 1000).length} this week
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-sm border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total</p>
                          <p className="text-2xl font-bold text-blue-700">{bookings.length}</p>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">All time sessions</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Today's Focus & Urgent Actions */}
                {(todayAppointments.length > 0 || categorizedSessions.ongoing.length > 0 || categorizedSessions.past.length > 0) && (
                  <Card className="bg-white shadow-sm border-gray-200">
                    <CardContent className="p-4 sm:p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell className="h-5 w-5 text-amber-600" />
                        Priority Actions
                      </h2>
                      <div className="space-y-3">
                        {/* Ongoing sessions - highest priority */}
                        {categorizedSessions.ongoing.map((booking) => {
                          const clientName = clientNames[booking.client_id] || `Client ${booking.client_id.slice(0, 8)}...${booking.client_id.slice(-4)}`
                          return (
                            <div key={`ongoing-${booking.id}`} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="h-3 w-3 bg-orange-500 rounded-full animate-pulse" />
                                <div>
                                  <p className="font-medium text-gray-900">Live: {clientName}</p>
                                  <p className="text-sm text-gray-600">{booking.service_type || `Service #${booking.service_id}`}</p>
                                </div>
                              </div>
                              <Badge className="bg-orange-100 text-orange-800 animate-pulse">ONGOING</Badge>
                            </div>
                          )
                        })}

                        {/* Today's upcoming sessions */}
                        {todayAppointments.slice(0, 3).map((appointment) => (
                          <div key={`today-${appointment.id}`} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="font-medium text-gray-900">Today {appointment.time}: {appointment.client}</p>
                                <p className="text-sm text-gray-600">{appointment.service}</p>
                              </div>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">TODAY</Badge>
                          </div>
                        ))}

                        {/* Past sessions that need attention */}
                        {categorizedSessions.past.slice(0, 2).map((booking) => {
                          const clientName = clientNames[booking.client_id] || `Client ${booking.client_id.slice(0, 8)}...${booking.client_id.slice(-4)}`
                          const bookingDate = new Date(booking.booking_date || booking.scheduled_date || '')
                          return (
                            <div key={`past-${booking.id}`} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-yellow-600" />
                                <div>
                                  <p className="font-medium text-gray-900">Needs followup: {clientName}</p>
                                  <p className="text-sm text-gray-600">{bookingDate.toLocaleDateString()} • {booking.status}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" className="text-xs" onClick={() => setActiveTab('sessions')}>
                                Review
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions - Only show if no urgent items */}
                <Card className="bg-white shadow-sm border-gray-200">
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-emerald-600" />
                      Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 justify-center"
                        onClick={() => setActiveTab('sessions')}
                      >
                        <Calendar className="h-4 w-4" /> 
                        <span>My Sessions</span>
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex items-center gap-2 justify-center border-gray-300 hover:bg-gray-50"
                        onClick={() => setActiveTab('services')}
                      >
                        <Settings className="h-4 w-4" /> 
                        <span>Manage Services</span>
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex items-center gap-2 justify-center border-gray-300 hover:bg-gray-50"
                        onClick={() => setActiveTab('profile')}
                      >
                        <User className="h-4 w-4" /> 
                        <span>Update Profile</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Performance Insight */}
                {bookings.length > 0 && (
                  <Card className="bg-white shadow-sm border-gray-200">
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        This Week's Insights
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {categorizedSessions.completed.filter(b => {
                              const bookingDate = new Date(b.booking_date || b.scheduled_date || '')
                              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                              return bookingDate >= weekAgo
                            }).length}
                          </div>
                          <div className="text-sm text-gray-600">Sessions Completed</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round((categorizedSessions.completed.length / Math.max(bookings.length, 1)) * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Completion Rate</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {bookings.filter(b => b.intake_form_data).length}
                          </div>
                          <div className="text-sm text-gray-600">With Intake Forms</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* My Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            {/* Header with Quick Stats */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">My Sessions</h2>
                  <p className="text-emerald-100">Manage and track all your client consultations</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold">{categorizedSessions.upcoming.length}</div>
                    <div className="text-xs text-emerald-100">Upcoming</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold text-orange-200">{categorizedSessions.ongoing.length}</div>
                    <div className="text-xs text-emerald-100">Live</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold">{categorizedSessions.completed.length}</div>
                    <div className="text-xs text-emerald-100">Completed</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold">{categorizedSessions.past.length}</div>
                    <div className="text-xs text-emerald-100">Past</div>
                  </div>
                </div>
              </div>
            </div>

            {!initialBookingsLoaded ? (
              <Card className="bg-white shadow-sm border-gray-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-48 mx-auto"></div>
                      </div>
                    </div>
                    <p className="text-gray-500 mt-4">Loading your sessions...</p>
                  </div>
                </CardContent>
              </Card>
            ) : bookings.length === 0 ? (
              <Card className="bg-white shadow-sm border-gray-200">
                <CardContent className="p-8 sm:p-12">
                  <div className="text-center text-gray-500">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Calendar className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Sessions Yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Your client sessions will appear here once they start booking appointments with you.
                    </p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setActiveTab('profile')}
                    >
                      Complete Your Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Upcoming Sessions */}
                {categorizedSessions.upcoming.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Upcoming Sessions
                        </h3>
                        <p className="text-sm text-gray-500">{categorizedSessions.upcoming.length} sessions scheduled</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-4">
                      {categorizedSessions.upcoming.map((booking, index) => {
                        const clientName = clientNames[booking.client_id] || `Client ${booking.client_id.slice(0, 8)}...${booking.client_id.slice(-4)}`
                        const bookingDate = new Date(booking.booking_date || booking.scheduled_date || '')
                        const isToday = bookingDate.toDateString() === new Date().toDateString()
                        const isTomorrow = bookingDate.toDateString() === new Date(Date.now() + 86400000).toDateString()
                        const timeUntil = bookingDate.getTime() - Date.now()
                        const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60))
                        const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60))
                        
                        return (
                          <Card key={booking.id} className={`group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                            isToday ? 'ring-2 ring-green-200 bg-green-50' : 
                            isTomorrow ? 'ring-2 ring-blue-200 bg-blue-50' :
                            'bg-white border-gray-200'
                          }`} onClick={() => handleViewSessionDetail(booking)}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                      {clientName.charAt(7).toUpperCase()}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900 text-lg">{clientName}</h4>
                                      <p className="text-sm text-gray-600">{booking.service_type || `Service #${booking.service_id}`}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{bookingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      <span>{bookingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                                    </div>
                                    {booking.duration_minutes && (
                                      <div className="flex items-center gap-1">
                                        <span className="w-4 h-4 flex items-center justify-center">⏱️</span>
                                        <span>{booking.duration_minutes}min</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Time Until Session */}
                                  {isToday && timeUntil > 0 && (
                                    <div className="mb-3">
                                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        {hoursUntil > 0 ? `${hoursUntil}h ${minutesUntil}m remaining` : `${minutesUntil}m remaining`}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 flex-wrap">
                                    {isToday && <Badge className="bg-green-100 text-green-800 text-xs font-medium">Today</Badge>}
                                    {isTomorrow && <Badge className="bg-blue-100 text-blue-800 text-xs font-medium">Tomorrow</Badge>}
                                    {booking.intake_form_data && (
                                      <Badge className="bg-indigo-100 text-indigo-800 text-xs font-medium flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        Intake Form
                                      </Badge>
                                    )}
                                    {bookingDocuments[booking.id] && bookingDocuments[booking.id].length > 0 && (
                                      <Badge className="bg-purple-100 text-purple-800 text-xs font-medium flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        {bookingDocuments[booking.id].length} Documents
                                      </Badge>
                                    )}
                                    {booking.meeting_notes && (
                                      <Badge className="bg-amber-100 text-amber-800 text-xs font-medium flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        Notes
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                  <Badge className={`${getStatusBadge(booking.status)} font-medium`}>
                                    {booking.status}
                                  </Badge>
                                  <div className="text-right text-xs text-gray-500">
                                    #{booking.id}
                                  </div>
                                </div>
                              </div>
                              
                                <div className="border-t pt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                                  {booking.status === 'confirmed' && (
                                    <>
                                      {(() => {
                                        const start = new Date(booking.booking_date || booking.scheduled_date || '')
                                        const end = new Date(start.getTime() + (booking.duration_minutes * 60 * 1000))
                                        const nowX = new Date()
                                        const inWindow = nowX >= new Date(start.getTime() - 10 * 60 * 1000) && nowX <= new Date(end.getTime() + 10 * 60 * 1000)
                                        const hasRoom = Boolean((booking as any).meeting_url || (booking as any).meeting_link)
                                        if (!inWindow) return null
                                        return (
                                          <Button 
                                            size="sm" 
                                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1" 
                                            onClick={() => handleStartOrJoin(booking)}
                                          >
                                            {hasRoom ? 'Join Room' : 'Start Session'}
                                          </Button>
                                        )
                                      })()}
                                      <Button 
                                        size="sm" 
                                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1" 
                                        onClick={() => handleStatusChange(booking.id, 'completed')} 
                                        disabled={updatingStatus === booking.id}
                                      >
                                        {updatingStatus === booking.id ? (
                                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                                        ) : (
                                          <>✓</>
                                        )}
                                        Complete
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="border-orange-200 text-orange-600 hover:bg-orange-50 flex items-center gap-1" 
                                        onClick={() => handleStatusChange(booking.id, 'delayed')} 
                                        disabled={updatingStatus === booking.id}
                                      >
                                        {updatingStatus === booking.id ? (
                                          <div className="animate-spin rounded-full h-3 w-3 border-b border-orange-600"></div>
                                        ) : (
                                          <>⏸️</>
                                        )}
                                        Delay
                                      </Button>
                                    </>
                                  )}
                                  {booking.status !== 'pending' && booking.status !== 'confirmed' && (
                                    <Button 
                                      size="sm" 
                                      className="bg-blue-600 hover:bg-blue-700" 
                                      onClick={() => handleStatusChange(booking.id, 'confirmed')} 
                                      disabled={updatingStatus === booking.id}
                                    >
                                      {updatingStatus === booking.id ? 'Updating...' : 'Reopen'}
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* Ongoing Sessions */}
                {categorizedSessions.ongoing.length > 0 && (
                  <Card className="bg-white shadow-sm border-gray-200">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-5 w-5 bg-orange-500 rounded-full animate-pulse" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Ongoing Sessions ({categorizedSessions.ongoing.length})
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {categorizedSessions.ongoing.map((booking) => {
                          const clientName = clientNames[booking.client_id] || `Client ${booking.client_id.slice(0, 8)}...${booking.client_id.slice(-4)}`
                          const bookingDate = new Date(booking.booking_date || booking.scheduled_date || '')
                          
                          return (
                            <div key={booking.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewSessionDetail(booking)}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900">{clientName}</h4>
                                    <Badge className="bg-orange-100 text-orange-800 text-xs animate-pulse">LIVE</Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">{booking.service_type || `Service #${booking.service_id}`}</p>
                                  <p className="text-sm text-gray-500">
                                    Started at {bookingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    {booking.intake_form_data && <Badge className="bg-blue-100 text-blue-800 text-xs">Intake Form</Badge>}
                                    {bookingDocuments[booking.id] && bookingDocuments[booking.id].length > 0 && (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        {bookingDocuments[booking.id].length} Docs
                                      </Badge>
                                    )}
                                    {booking.meeting_notes && <Badge className="bg-purple-100 text-purple-800 text-xs">Notes</Badge>}
                                  </div>
                                </div>
                                <Badge className={getStatusBadge(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(booking.id, 'completed')} disabled={updatingStatus === booking.id}>
                                  {updatingStatus === booking.id ? 'Updating...' : 'Complete'}
                                </Button>
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => handleStatusChange(booking.id, 'delayed')} disabled={updatingStatus === booking.id}>
                                  {updatingStatus === booking.id ? 'Updating...' : 'Delay'}
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Completed Sessions */}
                {categorizedSessions.completed.length > 0 && (
                  <Card className="bg-white shadow-sm border-gray-200">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-5 w-5 bg-green-500 rounded-full" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Completed Sessions ({categorizedSessions.completed.length})
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {categorizedSessions.completed.slice(0, 5).map((booking) => {
                          const clientName = clientNames[booking.client_id] || `Client ${booking.client_id.slice(0, 8)}...${booking.client_id.slice(-4)}`
                          const bookingDate = new Date(booking.booking_date || booking.scheduled_date || '')
                          const isRecent = Date.now() - bookingDate.getTime() < 7 * 24 * 60 * 60 * 1000 // Within 7 days
                          
                          return (
                            <div key={booking.id} className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewSessionDetail(booking)}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900">{clientName}</h4>
                                    {isRecent && <Badge className="bg-green-100 text-green-800 text-xs">Recent</Badge>}
                                  </div>
                                  <p className="text-sm text-gray-600">{booking.service_type || `Service #${booking.service_id}`}</p>
                                  <p className="text-sm text-gray-500">
                                    {bookingDate.toLocaleDateString()} at {bookingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    {booking.intake_form_data && <Badge className="bg-blue-100 text-blue-800 text-xs">Intake Form</Badge>}
                                    {bookingDocuments[booking.id] && bookingDocuments[booking.id].length > 0 && (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        {bookingDocuments[booking.id].length} Docs
                                      </Badge>
                                    )}
                                    {booking.meeting_notes && <Badge className="bg-purple-100 text-purple-800 text-xs">Notes</Badge>}
                                  </div>
                                </div>
                                <Badge className={getStatusBadge(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </div>
                            </div>
                          )
                        })}
                        {categorizedSessions.completed.length > 5 && (
                          <div className="text-center pt-2">
                            <p className="text-sm text-gray-500">Showing 5 of {categorizedSessions.completed.length} completed sessions</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Past Sessions */}
                {categorizedSessions.past.length > 0 && (
                  <Card className="bg-white shadow-sm border-gray-200">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Past Sessions ({categorizedSessions.past.length})
                        </h3>
                        <p className="text-sm text-gray-500 ml-2">• Missed or Cancelled</p>
                      </div>
                      <div className="space-y-3">
                        {categorizedSessions.past.slice(0, 3).map((booking) => {
                          const clientName = clientNames[booking.client_id] || `Client ${booking.client_id.slice(0, 8)}...${booking.client_id.slice(-4)}`
                          const bookingDate = new Date(booking.booking_date || booking.scheduled_date || '')
                          
                          return (
                            <div key={booking.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewSessionDetail(booking)}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{clientName}</h4>
                                  <p className="text-sm text-gray-600">{booking.service_type || `Service #${booking.service_id}`}</p>
                                  <p className="text-sm text-gray-500">
                                    {bookingDate.toLocaleDateString()} at {bookingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    {booking.intake_form_data && <Badge className="bg-blue-100 text-blue-800 text-xs">Intake Form</Badge>}
                                    {bookingDocuments[booking.id] && bookingDocuments[booking.id].length > 0 && (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        {bookingDocuments[booking.id].length} Docs
                                      </Badge>
                                    )}
                                    {booking.meeting_notes && <Badge className="bg-purple-100 text-purple-800 text-xs">Notes</Badge>}
                                  </div>
                                </div>
                                <Badge className={getStatusBadge(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange(booking.id, 'confirmed')} disabled={updatingStatus === booking.id}>
                                  {updatingStatus === booking.id ? 'Updating...' : 'Reschedule'}
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                        {categorizedSessions.past.length > 3 && (
                          <div className="text-center pt-2">
                            <p className="text-sm text-gray-500">Showing 3 of {categorizedSessions.past.length} past sessions</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              </>
            )}
          </div>
        )}

        {/* Session Detail Modal */}
        {showSessionDetailModal && selectedSession && (
          <SessionDetailModal
            show={showSessionDetailModal}
            booking={selectedSession}
            clientName={clientNames[selectedSession.client_id] || `Client ${selectedSession.client_id.slice(0, 8)}...${selectedSession.client_id.slice(-4)}`}
            onClose={closeSessionDetailModal}
            onStatusChange={handleStatusChange}
            onViewDocument={handleViewDocument}
            onDownloadDocument={handleDownloadDocument}
            updatingStatus={updatingStatus}
            onNotesUpdate={(bookingId, notes) => {
              setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, meeting_notes: notes } as any : b))
            }}
          />
        )}


        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="space-y-6">
            {/* Bookings Calendar */}
            <RCICBookingsCalendar 
              consultantId={consultant?.id}
              clientNames={clientNames}
              onBookingClick={(booking) => {
                // Handle booking click - could open detail modal
                const fullBooking = bookings.find(b => b.id === booking.id);
                if (fullBooking) {
                  handleViewSessionDetail(fullBooking);
                }
              }}
            />
            
            {/* Availability Manager */}
            <RCICAvailabilityManager 
              consultantId={consultant?.id}
              onScheduleUpdated={() => {
                // Optionally refresh bookings or show success message
                console.log('Availability schedule updated');
              }}
            />
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/20">
                    {profileForm.profile_image_url ? (
                      <img 
                        src={profileForm.profile_image_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-12 w-12 text-white/60" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Award className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl font-bold mb-1">{profileForm.name || 'RCIC Profile'}</h2>
                  <p className="text-blue-100 mb-2">{profileForm.rcic_number ? `RCIC #${profileForm.rcic_number}` : 'Immigration Consultant'}</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {profileForm.location && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                        <span>📍</span>
                        <span>{profileForm.location}</span>
                      </div>
                    )}
                    {profileForm.experience && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                        <span>⭐</span>
                        <span>{profileForm.experience}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Profile Form */}
              <div className="lg:col-span-2">
                <Card className="bg-white shadow-sm border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Settings className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
                    </div>
                    
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleProfileSave() }}>
                      {/* Bio Section */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          Professional Bio
                        </label>
                        <textarea 
                          className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          rows={4}
                          value={profileForm.bio || ''}
                          onChange={(e) => handleProfileInputChange('bio', e.target.value)}
                          placeholder="Tell potential clients about your expertise, background, and what makes you unique as an immigration consultant..."
                        />
                        <p className="text-xs text-gray-500 mt-1">This will be displayed on your public profile</p>
                      </div>

                      {/* Experience & Languages */}
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Award className="h-4 w-4 text-blue-600" />
                            Experience
                          </label>
                          <select 
                            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                            value={profileForm.experience || ''}
                            onChange={(e) => handleProfileInputChange('experience', e.target.value)}
                          >
                            <option value="">Select your experience level</option>
                            <option value="1-2 years">1-2 years</option>
                            <option value="3-5 years">3-5 years</option>
                            <option value="5-10 years">5-10 years</option>
                            <option value="10-15 years">10-15 years</option>
                            <option value="15+ years">15+ years</option>
                            <option value="20+ years">20+ years</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none top-8">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <span className="text-blue-600">🌐</span>
                            Languages
                          </label>
                          <div className="relative">
                            <select 
                              className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                              multiple
                              value={Array.isArray(profileForm.languages) ? profileForm.languages : []}
                              onChange={(e) => {
                                const selectedLanguages = Array.from(e.target.selectedOptions, option => option.value)
                                handleProfileInputChange('languages', selectedLanguages)
                              }}
                            >
                              <option value="English">English</option>
                              <option value="French">French</option>
                              <option value="Spanish">Spanish</option>
                              <option value="Hindi">Hindi</option>
                              <option value="Punjabi">Punjabi</option>
                              <option value="Urdu">Urdu</option>
                              <option value="Arabic">Arabic</option>
                              <option value="Mandarin">Mandarin</option>
                              <option value="Cantonese">Cantonese</option>
                              <option value="Korean">Korean</option>
                              <option value="Japanese">Japanese</option>
                              <option value="Portuguese">Portuguese</option>
                              <option value="Russian">Russian</option>
                              <option value="German">German</option>
                              <option value="Italian">Italian</option>
                              <option value="Tagalog">Tagalog</option>
                              <option value="Vietnamese">Vietnamese</option>
                              <option value="Thai">Thai</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple languages</p>
                          {Array.isArray(profileForm.languages) && profileForm.languages.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {profileForm.languages.map((lang, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {lang}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentLanguages = Array.isArray(profileForm.languages) ? profileForm.languages : []
                                      const newLanguages = currentLanguages.filter((_: string, i: number) => i !== index)
                                      handleProfileInputChange('languages', newLanguages)
                                    }}
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Specialties */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span className="text-blue-600">🎯</span>
                          Specialization Areas
                        </label>
                        <div className="relative">
                          <select 
                            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                            multiple
                            value={Array.isArray(profileForm.specialties) ? profileForm.specialties : []}
                            onChange={(e) => {
                              const selectedSpecialties = Array.from(e.target.selectedOptions, option => option.value)
                              handleProfileInputChange('specialties', selectedSpecialties)
                            }}
                          >
                            <option value="Express Entry">Express Entry</option>
                            <option value="Provincial Nominee Program (PNP)">Provincial Nominee Program (PNP)</option>
                            <option value="Study Permits">Study Permits</option>
                            <option value="Work Permits">Work Permits</option>
                            <option value="Family Class Sponsorship">Family Class Sponsorship</option>
                            <option value="Visitor Visas">Visitor Visas</option>
                            <option value="Citizenship Applications">Citizenship Applications</option>
                            <option value="Refugee Protection">Refugee Protection</option>
                            <option value="Business Immigration">Business Immigration</option>
                            <option value="Start-up Visa Program">Start-up Visa Program</option>
                            <option value="Self-employed Persons Program">Self-employed Persons Program</option>
                            <option value="Caregiver Program">Caregiver Program</option>
                            <option value="Quebec Immigration">Quebec Immigration</option>
                            <option value="Appeals & Reviews">Appeals & Reviews</option>
                            <option value="Labour Market Impact Assessment (LMIA)">Labour Market Impact Assessment (LMIA)</option>
                            <option value="Permanent Residence Renewal">Permanent Residence Renewal</option>
                            <option value="Travel Documents">Travel Documents</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple specialization areas</p>
                        {Array.isArray(profileForm.specialties) && profileForm.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {profileForm.specialties.map((specialty, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {specialty}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentSpecialties = Array.isArray(profileForm.specialties) ? profileForm.specialties : []
                                    const newSpecialties = currentSpecialties.filter((_: string, i: number) => i !== index)
                                    handleProfileInputChange('specialties', newSpecialties)
                                  }}
                                  className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Location & Timezone */}
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <span className="text-blue-600">📍</span>
                            Office Location
                          </label>
                          <select 
                            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                            value={profileForm.location || ''}
                            onChange={(e) => handleProfileInputChange('location', e.target.value)}
                          >
                            <option value="">Select your office location</option>
                            <optgroup label="Alberta">
                              <option value="Calgary, AB, Canada">Calgary, AB, Canada</option>
                              <option value="Edmonton, AB, Canada">Edmonton, AB, Canada</option>
                            </optgroup>
                            <optgroup label="British Columbia">
                              <option value="Vancouver, BC, Canada">Vancouver, BC, Canada</option>
                              <option value="Victoria, BC, Canada">Victoria, BC, Canada</option>
                              <option value="Burnaby, BC, Canada">Burnaby, BC, Canada</option>
                              <option value="Surrey, BC, Canada">Surrey, BC, Canada</option>
                            </optgroup>
                            <optgroup label="Manitoba">
                              <option value="Winnipeg, MB, Canada">Winnipeg, MB, Canada</option>
                            </optgroup>
                            <optgroup label="New Brunswick">
                              <option value="Moncton, NB, Canada">Moncton, NB, Canada</option>
                              <option value="Saint John, NB, Canada">Saint John, NB, Canada</option>
                            </optgroup>
                            <optgroup label="Newfoundland and Labrador">
                              <option value="St. John's, NL, Canada">St. John's, NL, Canada</option>
                            </optgroup>
                            <optgroup label="Northwest Territories">
                              <option value="Yellowknife, NT, Canada">Yellowknife, NT, Canada</option>
                            </optgroup>
                            <optgroup label="Nova Scotia">
                              <option value="Halifax, NS, Canada">Halifax, NS, Canada</option>
                            </optgroup>
                            <optgroup label="Nunavut">
                              <option value="Iqaluit, NU, Canada">Iqaluit, NU, Canada</option>
                            </optgroup>
                            <optgroup label="Ontario">
                              <option value="Toronto, ON, Canada">Toronto, ON, Canada</option>
                              <option value="Ottawa, ON, Canada">Ottawa, ON, Canada</option>
                              <option value="Mississauga, ON, Canada">Mississauga, ON, Canada</option>
                              <option value="Brampton, ON, Canada">Brampton, ON, Canada</option>
                              <option value="Hamilton, ON, Canada">Hamilton, ON, Canada</option>
                              <option value="London, ON, Canada">London, ON, Canada</option>
                              <option value="Markham, ON, Canada">Markham, ON, Canada</option>
                              <option value="Vaughan, ON, Canada">Vaughan, ON, Canada</option>
                              <option value="Kitchener, ON, Canada">Kitchener, ON, Canada</option>
                              <option value="Windsor, ON, Canada">Windsor, ON, Canada</option>
                            </optgroup>
                            <optgroup label="Prince Edward Island">
                              <option value="Charlottetown, PE, Canada">Charlottetown, PE, Canada</option>
                            </optgroup>
                            <optgroup label="Quebec">
                              <option value="Montreal, QC, Canada">Montreal, QC, Canada</option>
                              <option value="Quebec City, QC, Canada">Quebec City, QC, Canada</option>
                              <option value="Laval, QC, Canada">Laval, QC, Canada</option>
                              <option value="Gatineau, QC, Canada">Gatineau, QC, Canada</option>
                            </optgroup>
                            <optgroup label="Saskatchewan">
                              <option value="Saskatoon, SK, Canada">Saskatoon, SK, Canada</option>
                              <option value="Regina, SK, Canada">Regina, SK, Canada</option>
                            </optgroup>
                            <optgroup label="Yukon">
                              <option value="Whitehorse, YT, Canada">Whitehorse, YT, Canada</option>
                            </optgroup>
                            <optgroup label="Remote/Online">
                              <option value="Remote - Canada Wide">Remote - Canada Wide</option>
                              <option value="Online Consultations Only">Online Consultations Only</option>
                            </optgroup>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none top-8">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            Timezone
                          </label>
                          <select 
                            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={profileForm.timezone || 'America/Toronto'} 
                            onChange={(e) => handleProfileInputChange('timezone', e.target.value)}
                          >
                            <option value="America/Toronto">Eastern Time (Toronto)</option>
                            <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                            <option value="America/Edmonton">Mountain Time (Edmonton)</option>
                            <option value="America/Winnipeg">Central Time (Winnipeg)</option>
                            <option value="America/Halifax">Atlantic Time (Halifax)</option>
                            <option value="America/St_Johns">Newfoundland Time</option>
                          </select>
                        </div>
                      </div>

                      {/* Calendly URL */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          Calendly Booking URL
                        </label>
                        <input 
                          className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          value={profileForm.calendly_url || ''} 
                          onChange={(e) => handleProfileInputChange('calendly_url', e.target.value)}
                          placeholder="https://calendly.com/your-username"
                        />
                        <p className="text-xs text-gray-500 mt-1">Clients will use this link to book appointments with you</p>
                      </div>

                      {/* Save Button */}
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            {profileSaveMessage && (
                              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                profileSaveMessage.includes('success') || profileSaveMessage.includes('updated') 
                                  ? 'bg-green-100 text-green-700 border border-green-200' 
                                  : 'bg-red-100 text-red-700 border border-red-200'
                              }`}>
                                <span>{profileSaveMessage.includes('success') || profileSaveMessage.includes('updated') ? '✅' : '❌'}</span>
                                <span>{profileSaveMessage}</span>
                              </div>
                            )}
                          </div>
                          <Button 
                            type="submit" 
                            disabled={savingProfile} 
                            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 flex items-center gap-2"
                          >
                            {savingProfile ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <Settings className="h-4 w-4" />
                                <span>Update Profile</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Sidebar */}
              <div className="space-y-6">
                {/* Profile Image Upload */}
                <Card className="bg-white shadow-sm border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Profile Photo
                    </h3>
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 mx-auto">
                          {profileForm.profile_image_url ? (
                            <img 
                              src={profileForm.profile_image_url} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={(e) => e.target.files && handleProfileImageUpload(e.target.files[0])} 
                          />
                          <Edit2 className="h-4 w-4 text-white" />
                        </label>
                      </div>
                      <p className="text-sm text-gray-600 mt-4">Click the edit icon to upload a new photo</p>
                      <p className="text-xs text-gray-500 mt-1">Recommended: Square image, 400x400px minimum</p>
                    </div>
                  </CardContent>
                </Card>

                {/* RCIC Credentials */}
                <Card className="bg-white shadow-sm border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      RCIC Credentials
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                        <div>
                          <p className="text-sm font-medium text-gray-700">RCIC Number</p>
                          <p className="text-lg font-bold text-blue-600">{profileForm.rcic_number || 'Not Set'}</p>
                        </div>
                        <div className="text-blue-600">
                          <Award className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Status</p>
                          <p className="text-sm font-semibold text-green-600">✅ Verified</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-white shadow-sm border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Profile Completion
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Overall Progress</span>
                          <span className="text-sm font-semibold text-blue-600">
                            {Math.round((
                              (profileForm.bio ? 1 : 0) +
                              (profileForm.experience ? 1 : 0) +
                              (profileForm.languages && Array.isArray(profileForm.languages) && profileForm.languages.length > 0 ? 1 : 0) +
                              (profileForm.specialties && Array.isArray(profileForm.specialties) && profileForm.specialties.length > 0 ? 1 : 0) +
                              (profileForm.location ? 1 : 0) +
                              (profileForm.profile_image_url ? 1 : 0)
                            ) / 6 * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.round((
                                (profileForm.bio ? 1 : 0) +
                                (profileForm.experience ? 1 : 0) +
                                (profileForm.languages && Array.isArray(profileForm.languages) && profileForm.languages.length > 0 ? 1 : 0) +
                                (profileForm.specialties && Array.isArray(profileForm.specialties) && profileForm.specialties.length > 0 ? 1 : 0) +
                                (profileForm.location ? 1 : 0) +
                                (profileForm.profile_image_url ? 1 : 0)
                              ) / 6 * 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className={`flex items-center gap-2 ${profileForm.bio ? 'text-green-600' : 'text-gray-400'}`}>
                          <span>{profileForm.bio ? '✅' : '⭕'}</span>
                          <span>Professional Bio</span>
                        </div>
                        <div className={`flex items-center gap-2 ${profileForm.profile_image_url ? 'text-green-600' : 'text-gray-400'}`}>
                          <span>{profileForm.profile_image_url ? '✅' : '⭕'}</span>
                          <span>Profile Photo</span>
                        </div>
                        <div className={`flex items-center gap-2 ${profileForm.experience ? 'text-green-600' : 'text-gray-400'}`}>
                          <span>{profileForm.experience ? '✅' : '⭕'}</span>
                          <span>Experience</span>
                        </div>
                        <div className={`flex items-center gap-2 ${profileForm.location ? 'text-green-600' : 'text-gray-400'}`}>
                          <span>{profileForm.location ? '✅' : '⭕'}</span>
                          <span>Location</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && consultant && (
          <ServicesTableView 
            consultantId={consultant.id}
            onServicesChange={() => {
              // Refresh services list if needed
              if (consultant) {
                consultantService.getConsultantServices(consultant.id)
                  .then(setServices)
                  .catch(console.error)
              }
            }}
          />
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <Card className="bg-white shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Payout Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900">This Month</h3>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">$2,840</p>
                    <p className="text-sm text-blue-700">32 sessions</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900">Last Month</h3>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">$3,120</p>
                    <p className="text-sm text-green-700">38 sessions</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg col-span-1 sm:col-span-2 lg:col-span-1">
                    <h3 className="font-medium text-purple-900">Total Earned</h3>
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">$28,450</p>
                    <p className="text-sm text-purple-700">324 sessions</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-4">Session Breakdown</h3>
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-3 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">Sarah Johnson</p>
                        <p className="text-sm text-gray-600">Document Review</p>
                        <p className="text-sm text-gray-500">Dec 15, 2024</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    </div>
                    <p className="font-medium text-lg text-green-600">$200</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">John Smith</p>
                        <p className="text-sm text-gray-600">30-min Consultation</p>
                        <p className="text-sm text-gray-500">Dec 14, 2024</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    </div>
                    <p className="font-medium text-lg text-green-600">$60</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">Mike Chen</p>
                        <p className="text-sm text-gray-600">45-min Consultation</p>
                        <p className="text-sm text-gray-500">Dec 13, 2024</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                    <p className="font-medium text-lg text-yellow-600">$85</p>
                  </div>
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Date</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Client</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Service</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Amount</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3">Dec 15, 2024</td>
                        <td className="p-3">Sarah Johnson</td>
                        <td className="p-3">Document Review</td>
                        <td className="p-3 font-medium text-green-600">$200</td>
                        <td className="p-3">
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">Dec 14, 2024</td>
                        <td className="p-3">John Smith</td>
                        <td className="p-3">30-min Consultation</td>
                        <td className="p-3 font-medium text-green-600">$60</td>
                        <td className="p-3">
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">Dec 13, 2024</td>
                        <td className="p-3">Mike Chen</td>
                        <td className="p-3">45-min Consultation</td>
                        <td className="p-3 font-medium text-yellow-600">$85</td>
                        <td className="p-3">
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6">
                  <Button className="bg-blue-600 hover:bg-blue-700">Download Receipt</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Intake Form Modal */}
      {showIntakeModal && selectedIntakeData && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Intake Form Details</h3>
              <Button variant="outline" onClick={closeIntakeModal} size="sm">
                <X className="h-4 w-4" />
              </Button>
    </div>
            
            <div className="text-sm text-gray-800 space-y-4">
              {/* Client Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Client Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Client ID:</span> {selectedClient.client_id}
                  </div>
                  <div>
                    <span className="font-medium">Service:</span> {selectedClient.service_type || `Service #${selectedClient.service_id}`}
                  </div>
                </div>
              </div>

              {/* Form Details */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Form Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Completion Status:</span> 
                    <Badge className={`ml-2 ${selectedIntakeData.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {selectedIntakeData.completed ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Form Method:</span> {selectedIntakeData.method || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Required Documents */}
              {selectedIntakeData.uploadedFiles && selectedIntakeData.uploadedFiles.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Required Documents ({selectedIntakeData.uploadedFiles.length})</h4>
                  <div className="space-y-2">
                    {selectedIntakeData.uploadedFiles.map((file: any, index: number) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded border border-green-200">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">{file.name}</p>
                            <p className="text-xs text-green-600">
                              {file.size > 1024 * 1024 
                                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                                : `${Math.round(file.size / 1024)} KB`
                              } • {file.type} • {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-3 text-xs"
                            onClick={() => handleViewDocument(file, selectedClient)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Documents */}
              {selectedIntakeData.optionalUploads && selectedIntakeData.optionalUploads.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Additional Documents ({selectedIntakeData.optionalUploads.length})</h4>
                  <div className="space-y-2">
                    {selectedIntakeData.optionalUploads.map((file: any, index: number) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded border border-blue-200">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-800">{file.name}</p>
                            <p className="text-xs text-blue-600">
                              {file.size > 1024 * 1024 
                                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                                : `${Math.round(file.size / 1024)} KB`
                              } • {file.type} • {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-3 text-xs"
                            onClick={() => handleViewDocument(file, selectedClient)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Form Fields */}
              {Object.entries(selectedIntakeData).map(([key, value]) => {
                if (['method', 'completed', 'uploadedFiles', 'optionalUploads'].includes(key)) {
                  return null
                }
                
                if (!value || (Array.isArray(value) && value.length === 0)) {
                  return null
                }

                // Helper function to render complex objects properly
                const renderValue = (val: any): React.ReactNode => {
                  if (typeof val === 'string') {
                    return val
                  }
                  if (typeof val === 'number') {
                    return val.toString()
                  }
                  if (typeof val === 'boolean') {
                    return val ? 'Yes' : 'No'
                  }
                  if (Array.isArray(val)) {
                    return val.join(', ')
                  }
                  if (typeof val === 'object' && val !== null) {
                    // For objects like previousApplications, render as a structured list
                    return (
                      <div className="space-y-1">
                        {Object.entries(val).map(([subKey, subValue]) => (
                          <div key={subKey} className="flex justify-between items-center">
                            <span className="font-medium capitalize text-sm">
                              {subKey.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="text-sm ml-2">
                              {typeof subValue === 'boolean' ? (subValue ? 'Yes' : 'No') : String(subValue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  return String(val)
                }

                return (
                  <div key={key} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <div className="text-sm text-gray-700">
                      {renderValue(value)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showDocumentModal && selectedDocument && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Document Details</h3>
              <Button variant="outline" onClick={closeDocumentModal} size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-800 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Client Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-medium">Client ID:</span> {selectedClient.client_id}</div>
                  <div><span className="font-medium">Service:</span> {selectedClient.service_type || `Service #${selectedClient.service_id}`}</div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Document Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-medium">File Name:</span> {selectedDocument.name}</div>
                  <div><span className="font-medium">File Size:</span> {selectedDocument.size > 1024 * 1024 ? `${(selectedDocument.size / 1024 / 1024).toFixed(2)} MB` : `${Math.round(selectedDocument.size / 1024)} KB`}</div>
                  <div><span className="font-medium">File Type:</span> {selectedDocument.type}</div>
                  <div><span className="font-medium">Uploaded At:</span> {new Date(selectedDocument.uploadedAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Document Preview</h4>
                {selectedDocument.type?.startsWith('image/') ? (
                  selectedDocument.url || selectedDocument.content ? (
                    <img
                      src={selectedDocument.url || `data:${selectedDocument.type};base64,${selectedDocument.content}`}
                      alt={selectedDocument.name}
                      className="w-full h-auto max-h-[70vh] object-contain mx-auto rounded-lg shadow-md border border-gray-200"
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                      <p>Image preview not available</p>
                      <p className="text-sm">File type: {selectedDocument.type}</p>
                      <p className="text-sm">File size: {selectedDocument.size > 1024 * 1024 ? `${(selectedDocument.size / 1024 / 1024).toFixed(2)} MB` : `${Math.round(selectedDocument.size / 1024)} KB`}</p>
                      <p className="text-sm">Please download to view</p>
                    </div>
                  )
                ) : selectedDocument.type === 'application/pdf' ? (
                  <iframe
                    src={selectedDocument.url || `data:${selectedDocument.type};base64,${selectedDocument.content}`}
                    className="w-full h-[70vh] border border-gray-200 rounded-lg"
                    title={selectedDocument.name}
                  />
                ) : selectedDocument.type?.startsWith('text/') ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {selectedDocument.content || 'Text content not available'}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                    <p>Preview not available for this file type</p>
                    <p className="text-sm">File type: {selectedDocument.type || 'Unknown'}</p>
                    <p className="text-sm">Please download to view</p>
                  </div>
                )}
                <div className="mt-4 flex justify-center gap-3">
                  <Button size="sm" variant="outline" onClick={() => handleOpenInNewTab(selectedDocument)}>Open in New Tab</Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleDownloadDocument(selectedDocument)}>Download</Button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={closeDocumentModal}>Close</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications Container */}
      <ToastContainer toasts={toasts.toasts} onRemoveToast={toasts.removeToast} />
    </div>
  )
}
