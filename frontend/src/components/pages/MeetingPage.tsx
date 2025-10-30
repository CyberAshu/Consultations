import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../shared/Button'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { 
  Video, 
  Phone, 
  Mic, 
  MicOff, 
  VideoOff, 
  Settings, 
  ArrowLeft, 
  Award, 
  MapPin, 
  Clock, 
  Calendar,
  User,
  Loader,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import { bookingService } from '../../services/bookingService'
import { consultantService } from '../../services/consultantService'
import { Booking, Consultant } from '../../services/types'
import { useAuth } from '../../hooks/useAuth'

export function MeetingPage() {
  const navigate = useNavigate()
  const { bookingId } = useParams<{ bookingId: string }>()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [consultant, setConsultant] = useState<Consultant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meetingStarted, setMeetingStarted] = useState(false)
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null)
  
  // Video/Audio controls state
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)

  useEffect(() => {
    const loadMeetingData = async () => {
      if (!bookingId) {
        setError('No booking ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Get booking details
        const bookingData = await bookingService.getBookingById(parseInt(bookingId))
        setBooking(bookingData)

        // Get consultant information
        if (bookingData.consultant_id) {
          const consultantData = await consultantService.getConsultantById(bookingData.consultant_id)
          setConsultant(consultantData)
        }

        // Check if meeting URL is provided in query params (from external video platform)
        const meetingLink = searchParams.get('url') || searchParams.get('meeting_url')
        if (meetingLink) {
          setMeetingUrl(meetingLink)
        } else if (consultant?.calendly_url) {
          // Fallback to consultant's Calendly URL if no specific meeting URL
          setMeetingUrl(consultant.calendly_url)
        }

      } catch (err: any) {
        console.error('Failed to load meeting data:', err)
        setError(err.message || 'Failed to load meeting information')
      } finally {
        setLoading(false)
      }
    }

    loadMeetingData()
  }, [bookingId, searchParams])

  const handleStartMeeting = () => {
    setMeetingStarted(true)
    
    // If we have an external meeting URL, open it
    if (meetingUrl) {
      window.open(meetingUrl, '_blank')
    } else {
      // Placeholder for custom video call implementation
      alert('Video call integration will be implemented here')
    }
  }

  const handleEndMeeting = () => {
    const confirmed = window.confirm('Are you sure you want to end the meeting?')
    if (confirmed) {
      setMeetingStarted(false)
      // Navigate back to dashboard
      navigate(user?.role === 'rcic' ? '/rcic-dashboard' : '/client-dashboard')
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    const dateStr = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
    return { date: dateStr, time: timeStr }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Preparing Meeting Room</h2>
          <p className="text-gray-600">Loading consultant information...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Meeting Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'Unable to load meeting information'}</p>
            <Button 
              onClick={() => navigate('/client-dashboard')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const bookingDateTime = booking.booking_date || booking.scheduled_date
  const { date, time } = bookingDateTime ? formatDateTime(bookingDateTime) : { date: '', time: '' }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(user?.role === 'rcic' ? '/rcic-dashboard' : '/client-dashboard')}
                  className="flex items-center gap-2 bg-white/80 border-gray-300 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Meeting Room
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Consultation Session • Booking #{booking.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800 hidden sm:flex">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Secure Session
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Meeting Area */}
          <div className="lg:col-span-2 space-y-6">
            {!meetingStarted ? (
              /* Pre-Meeting Setup */
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-blue-200">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <Video className="h-12 w-12 text-white" />
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Join Meeting</h2>
                      <p className="text-gray-600">
                        Click the button below to start your consultation session
                      </p>
                    </div>

                    {/* Meeting Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant={videoEnabled ? "default" : "outline"}
                        onClick={() => setVideoEnabled(!videoEnabled)}
                        className={`flex items-center gap-2 ${videoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300'}`}
                      >
                        {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        <span className="hidden sm:inline">
                          {videoEnabled ? 'Video On' : 'Video Off'}
                        </span>
                      </Button>
                      
                      <Button
                        variant={audioEnabled ? "default" : "outline"}
                        onClick={() => setAudioEnabled(!audioEnabled)}
                        className={`flex items-center gap-2 ${audioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300'}`}
                      >
                        {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        <span className="hidden sm:inline">
                          {audioEnabled ? 'Audio On' : 'Audio Off'}
                        </span>
                      </Button>
                    </div>

                    <Button 
                      onClick={handleStartMeeting}
                      className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Video className="h-5 w-5 mr-2" />
                      Join Meeting
                    </Button>

                    {meetingUrl && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800 flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          External meeting link detected - will open in new tab
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Active Meeting View */
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-green-200">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
                      <Video className="h-12 w-12 text-white" />
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Meeting in Progress</h2>
                      <p className="text-gray-600">
                        Your consultation session is now active
                      </p>
                    </div>

                    {/* Active Meeting Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant={videoEnabled ? "default" : "outline"}
                        onClick={() => setVideoEnabled(!videoEnabled)}
                        className={`flex items-center gap-2 ${videoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 text-gray-600'}`}
                      >
                        {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        variant={audioEnabled ? "default" : "outline"}
                        onClick={() => setAudioEnabled(!audioEnabled)}
                        className={`flex items-center gap-2 ${audioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 text-gray-600'}`}
                      >
                        {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">Settings</span>
                      </Button>
                    </div>

                    <Button 
                      onClick={handleEndMeeting}
                      variant="outline"
                      className="bg-red-600 hover:bg-red-700 text-white border-red-600 px-6 py-2"
                    >
                      <Phone className="h-4 w-4 mr-2 rotate-[135deg]" />
                      End Meeting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Session Information */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Session Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="text-sm font-medium text-gray-900">{date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Time:</span>
                    <span className="text-sm font-medium text-gray-900">{time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Service:</span>
                    <span className="text-sm font-medium text-gray-900">{booking.service_type || 'Consultation'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="text-sm font-medium text-gray-900">{booking.duration_minutes} minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consultant Information Sidebar */}
          <div className="space-y-6">
            {/* Consultant Profile Card */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-blue-200">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {/* Consultant Photo */}
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full border-4 border-blue-200 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 mx-auto shadow-lg">
                      {consultant?.profile_image_url ? (
                        <img 
                          src={consultant.profile_image_url} 
                          alt={`${consultant.name} - RCIC`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-12 w-12 text-blue-500" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Consultant Information */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {consultant?.name || 'Loading consultant...'}
                    </h2>
                    <p className="text-blue-600 font-medium mb-2">
                      {consultant?.rcic_number ? `RCIC #${consultant.rcic_number}` : 'Registered Immigration Consultant'}
                    </p>
                    
                    {/* Consultant Details */}
                    <div className="space-y-2 text-sm">
                      {consultant?.location && (
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{consultant.location}</span>
                        </div>
                      )}
                      
                      {consultant?.experience && (
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                          <Award className="h-3 w-3" />
                          <span>{consultant.experience} experience</span>
                        </div>
                      )}

                      {consultant?.rating && (
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                          <span>⭐</span>
                          <span>{consultant.rating}/5 ({consultant.review_count} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Specializations */}
                  {consultant?.specialties && consultant.specialties.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {consultant.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge 
                            key={index} 
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1"
                          >
                            {specialty}
                          </Badge>
                        ))}
                        {consultant.specialties.length > 3 && (
                          <Badge className="bg-gray-100 text-gray-600 text-xs px-2 py-1">
                            +{consultant.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {consultant?.languages && consultant.languages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {consultant.languages.slice(0, 3).map((language, index) => (
                          <Badge 
                            key={index} 
                            className="bg-green-100 text-green-800 text-xs px-2 py-1"
                          >
                            {language}
                          </Badge>
                        ))}
                        {consultant.languages.length > 3 && (
                          <Badge className="bg-gray-100 text-gray-600 text-xs px-2 py-1">
                            +{consultant.languages.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bio Card */}
            {consultant?.bio && (
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    About Your Consultant
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {consultant.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Meeting Instructions */}
            <Card className="bg-blue-50/80 backdrop-blur-sm shadow-lg border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Meeting Guidelines
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    Ensure you have a stable internet connection
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    Find a quiet, private location for the consultation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    Have your documents ready if requested by your consultant
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    Take notes during the session for future reference
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
