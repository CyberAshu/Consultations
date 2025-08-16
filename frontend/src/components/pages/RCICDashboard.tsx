import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../shared/Button'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { ToastContainer, useToasts } from '../ui/Toast'
import { Calendar, Clock, User, FileText, Settings, DollarSign, LogOut, ArrowLeft, Bell, Award, Wrench, Plus, Trash2, Edit2, X, Wifi, WifiOff } from 'lucide-react'
import { bookingService } from '../../services/bookingService'
import { consultantService } from '../../services/consultantService'
import { useAuth } from '../../hooks/useAuth'
import { Booking, Consultant, ConsultantServiceInDB } from '../../services/types'
import { Input } from '../ui/Input'
import { SessionDetailModal } from '../modals/SessionDetailModal'
import { useRealtimeBookingUpdates } from '../../hooks/useRealtimeBookingUpdates'

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
  const [isAdding, setIsAdding] = useState(false)
  const [newService, setNewService] = useState({
    name: '',
    duration: '',
    price: 0,
    description: '',
    is_active: true,
  })
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null)
  const [editService, setEditService] = useState({
    name: '',
    duration: '',
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
        setConsultant(prev => (prev ? { ...prev, ...updated } as any : prev))
      }
      setProfileSaveMessage('Profile image updated')
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
        console.log('Current user:', user);
        
        // First, get all consultants and find the one matching current user's user_id
        const allConsultants = await consultantService.getConsultants();
        console.log('All consultants:', allConsultants);
        
        const currentConsultant = allConsultants.find(consultant => consultant.user_id === user.id);
        console.log('Found consultant for current user:', currentConsultant);
        
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
      console.log(`🔥 Fetching documents for booking ${bookingId}...`)
      const response = await bookingService.getBookingDocuments(bookingId)
      console.log(`📄 Documents for booking ${bookingId}:`, response)
      
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
      
      // 🔥 FETCH DOCUMENTS FOR EACH BOOKING
      console.log('📄 Fetching documents for all bookings...')
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

  // All sessions from real booking data
  const allSessions = bookings.map(booking => ({
    id: booking.id,
    client: clientNames[booking.client_id] || `Client ${booking.client_id.slice(0, 8)}...${booking.client_id.slice(-4)}`,
    date: new Date(booking.booking_date || booking.scheduled_date || '').toDateString() === today ? 'Today' : 
          new Date(booking.booking_date || booking.scheduled_date || '').toLocaleDateString(),
    time: new Date(booking.booking_date || booking.scheduled_date || '').toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    }),
    service: booking.service_type || `Service #${booking.service_id}`,
    status: booking.status === 'confirmed' ? 'upcoming' : booking.status
  }))

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

  const resetNewService = () => {
    setNewService({ name: '', duration: '', price: 0, description: '', is_active: true })
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

  const handleDeleteService = async (serviceId: number) => {
    if (!consultant) return
    try {
      setServicesLoading(true)
      await consultantService.deleteConsultantService(consultant.id, serviceId)
      setServices(prev => prev.filter(s => s.id !== serviceId))
    } catch (error: any) {
      setServicesError(error?.message || 'Failed to delete service')
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
    // Prevent duplicate submissions
    if (updatingStatus === bookingId) return
    
    try {
      setUpdatingStatus(bookingId)
      setStatusUpdateError(null)
      const updated = await bookingService.updateBooking(bookingId, { status: newStatus } as any)
      setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status: updated.status } : b)))
      // Silent background refresh to sync any other fields without UI loader
      fetchBookings(false)
    } catch (err: any) {
      setStatusUpdateError(err?.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(null)
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
    console.log(`📝 RCIC Dashboard - Booking ${bookingId} status updated to: ${newStatus}`)
    
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
    console.error('RCIC Dashboard - Real-time connection error:', error)
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

  // Debug connection status changes
  useEffect(() => {
    console.log('🔌 Connection status changed:', {
      isConnected,
      connectionType,
      bookingsCount: bookings.length
    })
  }, [isConnected, connectionType, bookings.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 bg-white/60 border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Website</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
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
                  className="flex items-center gap-2 bg-white/60 border-gray-200 hover:bg-gray-50"
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
      <div className="bg-white/60 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-0 sm:space-x-2 overflow-x-auto scrollbar-hide pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 sm:py-4 px-2 sm:px-4 inline-flex items-center gap-1 sm:gap-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 min-w-0 flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50'
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
            {/* Today's Appointments */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Today's Appointments
                </h2>
                <div className="space-y-4">
                  {!initialBookingsLoaded ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
                      <p className="text-gray-500">Loading appointments...</p>
                    </div>
                  ) : todayAppointments.length > 0 ? (
                    todayAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{appointment.time}</p>
                            <p className="text-sm text-gray-600">{appointment.client}</p>
                            <p className="text-xs text-gray-500">{appointment.service}</p>
                          </div>
                        </div>
                        <Badge
                          className={
                            appointment.status === 'upcoming' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No appointments scheduled for today</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-emerald-600" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    onClick={() => navigate('/consultants')}
                  >
                    <Calendar className="h-4 w-4" /> Schedule New Session
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    onClick={() => setActiveTab('sessions')}
                  >
                    <FileText className="h-4 w-4" /> View All Sessions
                  </Button>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                    onClick={() => setActiveTab('services')}
                  >
                    <Settings className="h-4 w-4" /> Manage Services
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Sessions Tab */}
        {activeTab === 'sessions' && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">My Sessions</h2>
              
              {!initialBookingsLoaded ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
                  <p className="text-gray-500">Loading sessions...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p>No sessions found</p>
                  <p className="text-sm">Client sessions will appear here once they book appointments</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden space-y-4">
                    {bookings.map((booking) => {
                      const clientName = clientNames[booking.client_id] || `Client ${booking.client_id.slice(0, 8)}...${booking.client_id.slice(-4)}`
                      return (
                        <div key={booking.id} className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewSessionDetail(booking)}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{clientName}</h4>
                              <p className="text-sm text-gray-600">{booking.service_type || `Service #${booking.service_id}`}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(booking.booking_date || booking.scheduled_date || '').toLocaleDateString()} at {new Date(booking.booking_date || booking.scheduled_date || '').toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {booking.intake_form_data && <Badge className="bg-blue-100 text-blue-800 text-xs">Intake Form</Badge>}
                                {bookingDocuments[booking.id] && bookingDocuments[booking.id].length > 0 && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    {bookingDocuments[booking.id].length} Docs
                                  </Badge>
                                )}
                                {documentLoading[booking.id] && <Badge className="bg-gray-100 text-gray-600 text-xs">Loading docs...</Badge>}
                                {booking.meeting_notes && <Badge className="bg-purple-100 text-purple-800 text-xs">Notes</Badge>}
                              </div>
                            </div>
                            <Badge className={getStatusBadge(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                            {booking.status === 'pending' ? (
                              <>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1 min-w-0" onClick={() => handleStatusChange(booking.id, 'confirmed')} disabled={updatingStatus === booking.id}>
                                  {updatingStatus === booking.id ? 'Updating...' : 'Confirm'}
                                </Button>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 flex-1 min-w-0" onClick={() => handleStatusChange(booking.id, 'cancelled')} disabled={updatingStatus === booking.id}>
                                  {updatingStatus === booking.id ? 'Updating...' : 'Cancel'}
                                </Button>
                              </>
                            ) : booking.status === 'confirmed' ? (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1 min-w-0" onClick={() => handleStatusChange(booking.id, 'completed')} disabled={updatingStatus === booking.id}>
                                  {updatingStatus === booking.id ? 'Updating...' : 'Complete'}
                                </Button>
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 flex-1 min-w-0" onClick={() => handleStatusChange(booking.id, 'delayed')} disabled={updatingStatus === booking.id}>
                                  {updatingStatus === booking.id ? 'Updating...' : 'Delayed'}
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full" onClick={() => handleStatusChange(booking.id, 'confirmed')} disabled={updatingStatus === booking.id}>
                                {updatingStatus === booking.id ? 'Updating...' : 'Reopen'}
                              </Button>
                            )}
                          </div>
                          {statusUpdateError && <div className="text-xs text-red-600">{statusUpdateError}</div>}
                        </div>
                      )
                    })}
                  </div>
              
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 text-gray-700 whitespace-nowrap">Client Name</th>
                          <th className="text-left p-3 text-gray-700 whitespace-nowrap">Date & Time</th>
                          <th className="text-left p-3 text-gray-700 whitespace-nowrap">Service Type</th>
                          <th className="text-left p-3 text-gray-700 whitespace-nowrap">Status</th>
                          <th className="text-left p-3 text-gray-700 whitespace-nowrap">Info</th>
                          <th className="text-left p-3 text-gray-700 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => {
                          const clientName = clientNames[booking.client_id] || `Client ${booking.client_id.slice(0, 8)}...${booking.client_id.slice(-4)}`
                          return (
                            <tr key={booking.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleViewSessionDetail(booking)}>
                              <td className="p-3">{clientName}</td>
                              <td className="p-3">
                                {new Date(booking.booking_date || booking.scheduled_date || '').toLocaleDateString()} at {new Date(booking.booking_date || booking.scheduled_date || '').toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </td>
                              <td className="p-3">{booking.service_type || `Service #${booking.service_id}`}</td>
                              <td className="p-3">
                                <Badge className={getStatusBadge(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  {booking.intake_form_data && <Badge className="bg-blue-100 text-blue-800 text-xs">Intake</Badge>}
                                  {bookingDocuments[booking.id] && bookingDocuments[booking.id].length > 0 && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                      {bookingDocuments[booking.id].length} Docs
                                    </Badge>
                                  )}
                                  {documentLoading[booking.id] && <Badge className="bg-gray-100 text-gray-600 text-xs">Loading docs...</Badge>}
                                  {booking.meeting_notes && <Badge className="bg-purple-100 text-purple-800 text-xs">Notes</Badge>}
                                </div>
                              </td>
                              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                <div className="flex flex-wrap gap-1">
                                  {booking.status === 'pending' ? (
                                    <>
                                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange(booking.id, 'confirmed')} disabled={updatingStatus === booking.id}>
                                        {updatingStatus === booking.id ? 'Updating...' : 'Confirm'}
                                      </Button>
                                      <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleStatusChange(booking.id, 'cancelled')} disabled={updatingStatus === booking.id}>
                                        {updatingStatus === booking.id ? 'Updating...' : 'Cancel'}
                                      </Button>
                                    </>
                                  ) : booking.status === 'confirmed' ? (
                                    <>
                                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(booking.id, 'completed')} disabled={updatingStatus === booking.id}>
                                        {updatingStatus === booking.id ? 'Updating...' : 'Complete'}
                                      </Button>
                                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => handleStatusChange(booking.id, 'delayed')} disabled={updatingStatus === booking.id}>
                                        {updatingStatus === booking.id ? 'Updating...' : 'Delayed'}
                                      </Button>
                                    </>
                                  ) : (
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange(booking.id, 'confirmed')} disabled={updatingStatus === booking.id}>
                                      {updatingStatus === booking.id ? 'Updating...' : 'Reopen'}
                                    </Button>
                                  )}
                                </div>
                                {statusUpdateError && <div className="text-xs text-red-600">{statusUpdateError}</div>}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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


        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Settings</h2>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleProfileSave() }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea 
                      className="w-full border border-gray-300 p-3 rounded-md"
                      rows={4}
                      value={profileForm.bio || ''}
                      onChange={(e) => handleProfileInputChange('bio', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <input 
                      className="w-full border border-gray-300 p-2 sm:p-3 rounded-md"
                      value={profileForm.experience || ''}
                      onChange={(e) => handleProfileInputChange('experience', e.target.value)}
                      placeholder="e.g., 5+ years, 100+ clients"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                    <input 
                      className="w-full border border-gray-300 p-2 sm:p-3 rounded-md"
                      value={Array.isArray(profileForm.languages) ? profileForm.languages.join(', ') : (profileForm.languages || '')}
                      onChange={(e) => handleProfileInputChange('languages', e.target.value)}
                      placeholder="Comma-separated (e.g., English, Hindi)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                    <input 
                      className="w-full border border-gray-300 p-2 sm:p-3 rounded-md"
                      value={Array.isArray(profileForm.specialties) ? profileForm.specialties.join(', ') : (profileForm.specialties || '')}
                      onChange={(e) => handleProfileInputChange('specialties', e.target.value)}
                      placeholder="Comma-separated (e.g., Express Entry, Study Permits)"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input className="w-full border border-gray-300 p-2 rounded-md" value={profileForm.location || ''} onChange={(e) => handleProfileInputChange('location', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                      <input className="w-full border border-gray-300 p-2 rounded-md" value={profileForm.timezone || ''} onChange={(e) => handleProfileInputChange('timezone', e.target.value)} />
                  </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">RCIC Number</label>
                      <input className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-600" value={profileForm.rcic_number || ''} disabled readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Calendly URL</label>
                      <input className="w-full border border-gray-300 p-2 rounded-md" value={profileForm.calendly_url || ''} onChange={(e) => handleProfileInputChange('calendly_url', e.target.value)} />
                  </div>
                </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                    <div className="flex items-center gap-3">
                      {profileForm.profile_image_url ? (
                        <img src={profileForm.profile_image_url} alt="Profile" className="w-12 h-12 rounded-full object-cover border" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200" />
                      )}
                      <input type="file" accept="image/*" onChange={(e) => e.target.files && handleProfileImageUpload(e.target.files[0])} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={savingProfile} className="bg-blue-600 hover:bg-blue-700">{savingProfile ? 'Saving...' : 'Update Profile'}</Button>
                    {profileSaveMessage && <span className={profileSaveMessage.includes('success') || profileSaveMessage.includes('updated') ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>{profileSaveMessage}</span>}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-emerald-600" />
                    Services & Pricing
                  </h2>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                    onClick={() => setIsAdding(true)}
                  >
                    <Plus className="h-4 w-4" /> Add Service
                  </Button>
                </div>

                {servicesError && (
                  <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
                    {servicesError}
                  </div>
                )}

                {isAdding && (
                  <div className="mb-6 border rounded-xl p-4 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">New Service</h3>
                      <button onClick={() => { setIsAdding(false); resetNewService() }} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <Input value={newService.name} onChange={e => setNewService(s => ({ ...s, name: e.target.value }))} placeholder="e.g., 30-Min Consultation" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <Input value={newService.duration} onChange={e => setNewService(s => ({ ...s, duration: e.target.value }))} placeholder="e.g., 30m, 45m, 1h" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (CAD)</label>
                        <Input type="number" value={newService.price} onChange={e => setNewService(s => ({ ...s, price: Number(e.target.value) }))} placeholder="e.g., 60" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input className="w-full border border-gray-300 p-2 rounded-md" value={newService.description} onChange={e => setNewService(s => ({ ...s, description: e.target.value }))} placeholder="Short description" />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input id="is_active_new" type="checkbox" checked={newService.is_active} onChange={e => setNewService(s => ({ ...s, is_active: e.target.checked }))} />
                        <label htmlFor="is_active_new" className="text-sm text-gray-700">Active</label>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button onClick={handleAddService} className="bg-emerald-600 hover:bg-emerald-700">Save</Button>
                      <Button variant="outline" onClick={() => { setIsAdding(false); resetNewService() }}>Cancel</Button>
                    </div>
                  </div>
                )}

                {servicesLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading services...</div>
                ) : services.length === 0 ? (
                  <div className="text-center py-10 text-gray-600">
                    No services yet. Click "Add Service" to create your first service.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {services.map(svc => (
                      <div key={svc.id} className="border rounded-xl p-4 bg-white shadow-sm">
                        {editingServiceId === svc.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <Input value={editService.name} onChange={e => setEditService(s => ({ ...s, name: e.target.value }))} />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                <Input value={editService.duration} onChange={e => setEditService(s => ({ ...s, duration: e.target.value }))} />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (CAD)</label>
                                <Input type="number" value={editService.price} onChange={e => setEditService(s => ({ ...s, price: Number(e.target.value) }))} />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input className="w-full border border-gray-300 p-2 rounded-md" value={editService.description} onChange={e => setEditService(s => ({ ...s, description: e.target.value }))} />
                              </div>
                              <div className="sm:col-span-2 flex items-center gap-2">
                                <input id={`is_active_${svc.id}`} type="checkbox" checked={editService.is_active} onChange={e => setEditService(s => ({ ...s, is_active: e.target.checked }))} />
                                <label htmlFor={`is_active_${svc.id}`} className="text-sm text-gray-700">Active</label>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => handleUpdateService(svc.id)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                                <Edit2 className="h-4 w-4" /> Save
                              </Button>
                              <Button variant="outline" onClick={cancelEditService}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-medium text-gray-900">{svc.name}</h3>
                                {svc.is_active ? (
                                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{svc.description || 'No description'}</p>
                              <div className="text-sm text-gray-500">{svc.duration} • ${svc.price} CAD</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" onClick={() => startEditService(svc)} className="flex items-center gap-2">
                                <Edit2 className="h-4 w-4" /> Edit
                              </Button>
                              <Button variant="outline" onClick={() => handleDeleteService(svc.id)} className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" /> Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
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