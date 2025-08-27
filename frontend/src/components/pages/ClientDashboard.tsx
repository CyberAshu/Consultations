import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../shared/Button'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { ToastContainer, useToasts } from '../ui/Toast'
import { 
  Home, 
  Calendar, 
  FileText, 
  Settings, 
  Clock,
  Video,
  Upload,
  Download,
  LogOut,
  ArrowLeft,
  Bell,
  CheckCircle,
  AlertCircle,
  Plus,
  Loader,
  Trash2,
  Eye,
  Wifi,
  WifiOff,
  User as UserIcon
} from 'lucide-react'
import { bookingService } from '../../services/bookingService'
import { authService } from '../../services/authService'
import { Booking, User } from '../../services/types'
import { SessionDetailModal } from '../modals/SessionDetailModal'
import { useRealtimeBookingUpdates } from '../../hooks/useRealtimeBookingUpdates'

export function ClientDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Booking | null>(null)
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    language_preference: 'English',
    location: '',
    timezone: 'America/Toronto',
    immigration_notes: ''
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaveMessage, setProfileSaveMessage] = useState<string | null>(null)

  const tabs = [
    { id: 'dashboard', label: 'Home / Dashboard', icon: <Home className="h-4 w-4" /> },
    { id: 'bookings', label: 'My Bookings', icon: <Calendar className="h-4 w-4" /> },
    { id: 'settings', label: 'Account Settings', icon: <Settings className="h-4 w-4" /> }
  ]

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get current user from localStorage first
        const storedUser = authService.getStoredUser()
        if (storedUser) {
          setCurrentUser(storedUser)
          // Initialize profile form with user data
          setProfileForm({
            full_name: storedUser.full_name || '',
            email: storedUser.email || '',
            phone: '',
            language_preference: 'English',
            location: '',
            timezone: 'America/Toronto',
            immigration_notes: ''
          })
        }
        
        // Fetch user's bookings
        const userBookings = await bookingService.getBookings()
        setBookings(userBookings)
        
        // Try to get fresh user data from API
        try {
          const freshUser = await authService.getCurrentUser()
          setCurrentUser(freshUser)
          // Update profile form with fresh user data
          setProfileForm(prev => ({
            ...prev,
            full_name: freshUser.full_name || '',
            email: freshUser.email || ''
          }))
        } catch (userError) {
          // If API fails, we'll keep using stored user data
          console.warn('Could not fetch fresh user data:', userError)
        }
        
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setError('Failed to load dashboard data. Please try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    navigate('/login')
  }

  // Separate bookings into upcoming and past
  const now = new Date()
  const upcomingSessions = bookings.filter(booking => {
    const bookingDate = new Date(booking.booking_date || booking.scheduled_date || '')
    // Only show upcoming if:
    // 1. Date is in the future
    // 2. Status is not cancelled
    // 3. Status is not completed
    return bookingDate > now && booking.status !== 'cancelled' && booking.status !== 'completed'
  })
  
  const pastSessions = bookings.filter(booking => {
    const bookingDate = new Date(booking.booking_date || booking.scheduled_date || '')
    // Show as past if:
    // 1. Date has passed, OR
    // 2. Status is completed (regardless of date)
    return bookingDate <= now || booking.status === 'completed'
  })

  // Format date and time for display
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    const dateStr = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
    return { date: dateStr, time: timeStr }
  }

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get all documents from all bookings
  const allDocuments = bookings.flatMap(booking => 
    (booking.documents || []).map(doc => ({
      ...doc,
      booking_id: booking.id,
      booking_service: booking.service_type || `Service #${booking.service_id}`,
      booking_date: booking.booking_date || booking.scheduled_date
    }))
  )

  // Get intake forms from bookings
  const intakeForms = bookings.filter(booking => booking.intake_form_data).map(booking => ({
    id: booking.id,
    service: booking.service_type || `Service #${booking.service_id}`,
    date: booking.booking_date || booking.scheduled_date || new Date().toISOString(),
    data: booking.intake_form_data
  }))

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadError(null)
    }
  }

  const handleFileUpload = async () => {
    // Document upload functionality will be implemented later
    setUploadError('Document upload feature coming soon')
  }

  const handleProfileInputChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProfileSave = async () => {
    if (!currentUser) return

    try {
      setSavingProfile(true)
      setProfileSaveMessage(null)

      // Call API to update user profile
      const response = await fetch(`/api/v1/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          full_name: profileForm.full_name
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedUser = await response.json()
      setCurrentUser(updatedUser)
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      setProfileSaveMessage('Profile updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setProfileSaveMessage(null)
      }, 3000)

    } catch (error) {
      console.error('Profile update error:', error)
      setProfileSaveMessage('Failed to update profile. Please try again.')
    } finally {
      setSavingProfile(false)
    }
  }

  const formatDocumentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewSummary = (session: Booking) => {
    setSelectedSession(session)
    setShowSummaryModal(true)
  }

  const handleBookingRowClick = (session: Booking) => {
    setSelectedSession(session)
    setShowSummaryModal(true)
  }

  const handleCloseSummary = () => {
    setShowSummaryModal(false)
    setSelectedSession(null)
  }

  // Handle booking actions
  const handleJoinSession = (bookingId: number) => {
    // TODO: Implement actual video call integration
    alert(`Joining session for booking #${bookingId}`)
    console.log('Join session clicked for booking:', bookingId)
  }

  const handleRescheduleBooking = async (bookingId: number) => {
    const confirmed = window.confirm('Are you sure you want to reschedule this booking?')
    if (confirmed) {
      try {
        await bookingService.updateBooking(bookingId, { status: 'rescheduled' })
        // Refresh bookings
        const updatedBookings = await bookingService.getBookings()
        setBookings(updatedBookings)
        toasts.success('Booking Rescheduled', 'Your booking has been rescheduled successfully.')
      } catch (error: any) {
        toasts.error('Reschedule Failed', error.message || 'Failed to reschedule booking')
      }
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    const confirmed = window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')
    if (confirmed) {
      try {
        await bookingService.updateBooking(bookingId, { status: 'cancelled' })
        // Refresh bookings
        const updatedBookings = await bookingService.getBookings()
        setBookings(updatedBookings)
        toasts.success('Booking Cancelled', 'Your booking has been cancelled successfully.')
      } catch (error: any) {
        toasts.error('Cancellation Failed', error.message || 'Failed to cancel booking')
      }
    }
  }

  const handleRebookSession = (originalBookingId: number) => {
    // TODO: Implement rebooking with consultant
    alert(`Rebooking session based on booking #${originalBookingId}`)
    navigate('/consultants')
  }

  const handleViewDocument = async (doc: any) => {
    try {
      // Get document with download URL from the API
      const response = await fetch(`/api/v1/bookings/${doc.booking_id}/documents/${doc.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.download_url) {
          window.open(data.download_url, '_blank')
        } else {
          toasts.error('View Failed', 'Document URL not available')
        }
      } else {
        toasts.error('View Failed', 'Could not retrieve document URL')
      }
    } catch (error: any) {
      toasts.error('View Failed', error.message || 'Failed to view document')
    }
  }

  const handleDownloadDocument = async (doc: any) => {
    try {
      const response = await fetch(`/api/v1/bookings/${doc.booking_id}/documents/${doc.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.download_url) {
          const link = document.createElement('a')
          link.href = data.download_url
          link.download = data.file_name || doc.file_name || 'document'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          toasts.success('Download Started', 'Your document download has started.')
        } else {
          toasts.error('Download Failed', 'Document URL not available')
        }
      } else {
        toasts.error('Download Failed', 'Could not retrieve document URL')
      }
    } catch (error: any) {
      toasts.error('Download Failed', error.message || 'Failed to download document')
    }
  }

  const handleDeleteDocument = async (doc: any) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${doc.file_name}"? This action cannot be undone.`)
    if (confirmed) {
      try {
        // TODO: Implement document deletion API call
        alert('Document deletion functionality will be implemented soon.')
        console.log('Delete document:', doc)
      } catch (error: any) {
        toasts.error('Delete Failed', error.message || 'Failed to delete document')
      }
    }
  }

  // Initialize toast notifications
  const toasts = useToasts()

  // Handle booking status updates
  const handleBookingUpdate = useCallback((bookingId: number, newStatus: string) => {
    console.log(`📝 Booking ${bookingId} status updated to: ${newStatus}`)
    
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

    // Show toast notification
    toasts.bookingStatusUpdate(bookingId, oldStatus, newStatus)
  }, [bookings, toasts])

  // Handle real-time connection errors
  const handleRealtimeError = useCallback((error: string) => {
    console.error('Real-time connection error:', error)
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
    enabled: true, // ✅ ENABLED: Real-time booking status updates are now active
    fallbackToPolling: true,
    pollingInterval: 30000 // Poll every 30 seconds as fallback
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 bg-white/60 border-blue-200 text-blue-700 hover:bg-blue-50 px-3 py-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Website</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Client Dashboard
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Welcome back, {currentUser?.full_name || currentUser?.email || 'Guest'}
                  </p>
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
                  size="sm"
                  className="relative bg-white/60 border-gray-200 hover:bg-gray-50"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">2</span>
                </Button>
                
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
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
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

        {/* Error State */}
        {error && (
          <div className="mb-6">
            <Card className="bg-red-50 border-red-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800">{error}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      Welcome back, {currentUser?.full_name?.split(' ')[0] || 'Client'}!
                    </h2>
                    <p className="text-gray-600">Here's an overview of your immigration consultation activities.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Sessions */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Upcoming Sessions
                </h3>
                <div className="space-y-4">
                  {upcomingSessions.map((session) => {
                    const safeDateTime = (session.booking_date || session.scheduled_date || new Date().toISOString()) as string
                    const { date, time } = formatDateTime(safeDateTime)
                    return (
                      <div key={session.id} className="border border-blue-200/50 rounded-xl p-4 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{session.service_type}</h4>
                            <p className="text-sm text-gray-600">Consultant ID: {session.consultant_id}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Clock className="h-4 w-4" />
                              {date} at {time}
                            </p>
                          </div>
                          <Badge className={getStatusBadgeClass(session.status)}>
                            {session.status}
                          </Badge>
                        </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                      onClick={() => handleJoinSession(session.id)}
                    >
                      <Video className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Join Session</span>
                      <span className="sm:hidden">Join</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-shrink-0"
                      onClick={() => handleRescheduleBooking(session.id)}
                    >
                      <span className="hidden sm:inline">Reschedule</span>
                      <span className="sm:hidden">Reschedule</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-shrink-0"
                      onClick={() => handleCancelBooking(session.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                      </div>
                    )
                  })}
                  {upcomingSessions.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No upcoming sessions scheduled</p>
                      <Button 
                        className="mt-3 bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate('/consultants')}
                      >
                        Book Your First Session
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 h-12 sm:h-14 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    onClick={() => navigate('/consultants')}
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Book New Session</span>
                    <span className="sm:hidden">Book Session</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-12 sm:h-14 text-sm sm:text-base font-medium border-2 border-blue-200 text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => setActiveTab('documents')}
                  >
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Request Summary</span>
                    <span className="sm:hidden">Summary</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-12 sm:h-14 text-sm sm:text-base font-medium border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all duration-200 col-span-1 sm:col-span-2 lg:col-span-1"
                    onClick={() => navigate('/consultants')}
                  >
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Book Follow-up</span>
                    <span className="sm:hidden">Follow-up</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'bookings' && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">My Bookings</h2>
              
              {/* Upcoming Bookings */}
              <div className="mb-8">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Upcoming Sessions</h3>
                
                {/* Mobile Card View */}
                <div className="block lg:hidden space-y-4">
                  {upcomingSessions.map((session) => {
                    const safeDateTime = (session.booking_date || session.scheduled_date || new Date().toISOString()) as string
                    const { date, time } = formatDateTime(safeDateTime)
                    return (
                      <div key={session.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleBookingRowClick(session)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{session.service_type}</h4>
                            <p className="text-sm text-gray-600">Consultant ID: {session.consultant_id}</p>
                            <p className="text-sm text-gray-500">{date} at {time}</p>
                          </div>
                          <Badge className={getStatusBadgeClass(session.status)}>
                            {session.status}
                          </Badge>
                        </div>
                      <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 flex-1 min-w-0"
                          onClick={() => handleJoinSession(session.id)}
                        >
                          Join
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 min-w-0"
                          onClick={() => handleRescheduleBooking(session.id)}
                        >
                          Reschedule
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700 flex-1 min-w-0"
                          onClick={() => handleCancelBooking(session.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                    )
                  })}
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Service</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">RCIC</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Date & Time</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Status</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingSessions.map((session) => {
                        const safeDateTime = (session.booking_date || session.scheduled_date || new Date().toISOString()) as string
                        const { date, time } = formatDateTime(safeDateTime)
                        return (
                          <tr key={session.id} className="border-b cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleBookingRowClick(session)}>
                            <td className="p-3 font-medium">{session.service_type}</td>
                            <td className="p-3">Consultant ID: {session.consultant_id}</td>
                            <td className="p-3">{date} {time}</td>
                            <td className="p-3">
                              <Badge className={getStatusBadgeClass(session.status)}>
                                {session.status}
                              </Badge>
                            </td>
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-wrap gap-1">
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleJoinSession(session.id)}
                              >
                                Join
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRescheduleBooking(session.id)}
                              >
                                Reschedule
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleCancelBooking(session.id)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </td>
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Past Bookings */}
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Past Sessions</h3>
                
                {/* Mobile Card View */}
                <div className="block lg:hidden space-y-4">
                  {pastSessions.map((session) => {
                    const safeDateTime = (session.booking_date || session.scheduled_date || new Date().toISOString()) as string
                    const { date, time } = formatDateTime(safeDateTime)
                    return (
                      <div key={session.id} className="bg-gray-50 rounded-xl p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleBookingRowClick(session)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{session.service_type}</h4>
                            <p className="text-sm text-gray-600">Consultant ID: {session.consultant_id}</p>
                            <p className="text-sm text-gray-500">{date} at {time}</p>
                          </div>
                          <Badge className={getStatusBadgeClass(session.status)}>
                            {session.status}
                          </Badge>
                        </div>
                      <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 min-w-0"
                          onClick={() => handleViewSummary(session)}
                        >
                          View Summary
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 flex-1 min-w-0"
                          onClick={() => handleRebookSession(session.id)}
                        >
                          Rebook
                        </Button>
                      </div>
                    </div>
                    )
                  })}
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Service</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">RCIC</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Date & Time</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Status</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastSessions.map((session) => {
                        const safeDateTime = (session.booking_date || session.scheduled_date || new Date().toISOString()) as string
                        const { date, time } = formatDateTime(safeDateTime)
                        return (
                          <tr key={session.id} className="border-b cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleBookingRowClick(session)}>
                            <td className="p-3 font-medium">{session.service_type}</td>
                            <td className="p-3">Consultant ID: {session.consultant_id}</td>
                            <td className="p-3">{date} {time}</td>
                            <td className="p-3">
                              <Badge className={getStatusBadgeClass(session.status)}>
                                {session.status}
                              </Badge>
                            </td>
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-wrap gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewSummary(session)}
                              >
                                View Summary
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleRebookSession(session.id)}
                              >
                                Rebook
                              </Button>
                            </div>
                          </td>
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Account Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/20">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="h-12 w-12 text-white/60 flex items-center justify-center rounded-full bg-white/10">
                        <span className="text-2xl font-bold">
                          {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl font-bold mb-1">{currentUser?.full_name || 'Client Profile'}</h2>
                  <p className="text-blue-100 mb-2">Immigration Client</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {currentUser?.email && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                        <span>📧</span>
                        <span>{currentUser.email}</span>
                      </div>
                    )}
                    {currentUser?.email_verified && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                        <span>✅</span>
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Settings className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-blue-600" />
                        Full Name
                      </label>
                      <input 
                        className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        type="text"
                        value={profileForm.full_name || ''}
                        onChange={(e) => handleProfileInputChange('full_name', e.target.value)}
                        placeholder="Enter your full name"
                        onBlur={handleProfileSave}
                      />
                      <p className="text-xs text-gray-500 mt-1">Changes are saved automatically</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="text-blue-600">📧</span>
                        Email Address
                      </label>
                      <input 
                        className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                        type="email"
                        value={profileForm.email || ''}
                        disabled
                        placeholder="Email managed by authentication system"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email changes must be done through account security settings</p>
                    </div>
                  </div>

                  {/* Save Status */}
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
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">PNP Consultation</p>
                        <p className="text-sm text-gray-500">Dec 10, 2024</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    </div>
                    <p className="font-medium text-lg">$120 CAD</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">Study Permit Consultation</p>
                        <p className="text-sm text-gray-500">Nov 28, 2024</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    </div>
                    <p className="font-medium text-lg">$85 CAD</p>
                  </div>
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Date</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Service</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Amount</th>
                        <th className="text-left p-3 text-gray-700 whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3">Dec 10, 2024</td>
                        <td className="p-3">PNP Consultation</td>
                        <td className="p-3 font-medium">$120 CAD</td>
                        <td className="p-3">
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">Nov 28, 2024</td>
                        <td className="p-3">Study Permit Consultation</td>
                        <td className="p-3 font-medium">$85 CAD</td>
                        <td className="p-3">
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
      
      {/* Session Detail Modal */}
      <SessionDetailModal
        show={showSummaryModal}
        booking={selectedSession}
        clientName={currentUser?.full_name || currentUser?.email || 'Client'}
        onClose={handleCloseSummary}
        onStatusChange={() => {}} // Clients can't change status
        onDownloadDocument={async (file) => {
          if (file.url || file.download_url) {
            const link = document.createElement('a')
            link.href = file.url || file.download_url
            link.download = file.name || file.file_name || 'document'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
        }}
        updatingStatus={null}
        onNotesUpdate={() => {}} // Clients can't update notes
        isClientView={true} // Add this prop to indicate client view
      />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts.toasts} onRemoveToast={toasts.removeToast} />
    </div>
  )
}
