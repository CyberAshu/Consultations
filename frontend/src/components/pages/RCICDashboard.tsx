import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../shared/Button'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Calendar, Clock, User, FileText, Settings, DollarSign, AlertCircle, LogOut, ArrowLeft, Bell, Award } from 'lucide-react'
import { bookingService } from '../../services/bookingService'
import { consultantService } from '../../services/consultantService'
import { useAuth } from '../../hooks/useAuth'
import { Booking, Consultant, ConsultantServiceInDB } from '../../services/types'

export function RCICDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [consultant, setConsultant] = useState<Consultant | null>(null)
  
  

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

  // Fetch bookings after consultant data is loaded
  useEffect(() => {
    if (!consultant) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        // Get bookings for the current consultant
        const data = await bookingService.getBookings();
        console.log('Fetched bookings:', data);
        
        // Filter bookings for the current consultant
        const filteredBookings = data.filter(booking => booking.consultant_id === consultant.id);
        console.log('Filtered bookings for consultant:', consultant.id, filteredBookings);
        
        setBookings(filteredBookings);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        // Set empty array if fetching fails
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [consultant]);


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
    { id: 'intake', label: 'Intake Forms', icon: <FileText className="h-4 w-4" /> },
    { id: 'profile', label: 'Profile & Calendar', icon: <Settings className="h-4 w-4" /> },
    { id: 'payments', label: 'Payments', icon: <DollarSign className="h-4 w-4" /> }
  ]

  // Compute today's appointments from real booking data
  const today = new Date().toDateString()
  const todayAppointments = bookings
    .filter(booking => new Date(booking.scheduled_date).toDateString() === today)
    .map(booking => ({
      id: booking.id,
      client: `Client ${booking.client_id}`, // In real app, you'd fetch client name
      time: new Date(booking.scheduled_date).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      service: booking.service_type,
      status: booking.status === 'confirmed' ? 'upcoming' : booking.status
    }))

  // All sessions from real booking data
  const allSessions = bookings.map(booking => ({
    id: booking.id,
    client: `Client ${booking.client_id}`, // In real app, you'd fetch client name
    date: new Date(booking.scheduled_date).toDateString() === today ? 'Today' : 
          new Date(booking.scheduled_date).toLocaleDateString(),
    time: new Date(booking.scheduled_date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    }),
    service: booking.service_type,
    status: booking.status === 'confirmed' ? 'upcoming' : booking.status
  }))

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
                <Button 
                  variant="outline" 
                  size="sm"
                  className="relative bg-white/60 border-gray-200 hover:bg-gray-50"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
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
                  {loading ? (
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

            {/* Action Notifications */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Action Notifications
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-800">Client no-show alert: Mike Chen (4:00 PM session)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-800">Follow-up reminder: Contact Sarah Johnson within 48 hours</span>
                  </div>
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
              
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4">
                {allSessions.map((session) => (
                  <div key={session.id} className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{session.client}</h4>
                        <p className="text-sm text-gray-600">{session.service}</p>
                        <p className="text-sm text-gray-500">{session.date} at {session.time}</p>
                      </div>
                      <Badge
                        className={
                          session.status === 'upcoming' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }
                      >
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {session.status === 'upcoming' ? (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1 min-w-0">
                            Mark Complete
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 min-w-0">
                            Extend Session
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full">
                          Upload Summary
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
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
                      <th className="text-left p-3 text-gray-700 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSessions.map((session) => (
                      <tr key={session.id} className="border-b">
                        <td className="p-3">{session.client}</td>
                        <td className="p-3">{session.date} {session.time}</td>
                        <td className="p-3">{session.service}</td>
                        <td className="p-3">
                          <Badge
                            className={
                              session.status === 'upcoming' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }
                          >
                            {session.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {session.status === 'upcoming' ? (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  Mark Complete
                                </Button>
                                <Button size="sm" variant="outline">
                                  Extend Session
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                Upload Summary
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Intake Forms Tab */}
        {activeTab === 'intake' && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Intake Forms & Documents</h2>
              <div className="space-y-4">
                <div className="border border-gray-200/50 rounded-xl p-4 bg-gradient-to-r from-white to-gray-50/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">Sarah Johnson - Document Review</h3>
                    <span className="text-sm text-gray-500">Uploaded 2 hours ago</span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <Button size="sm" variant="outline">Download All</Button>
                    <Button size="sm" variant="outline">Preview</Button>
                  </div>
                  <textarea 
                    className="w-full border rounded-md p-3 text-sm"
                    rows={3}
                    placeholder="Add internal session notes here..."
                  />
                </div>
                <div className="border border-gray-200/50 rounded-xl p-4 bg-gradient-to-r from-white to-gray-50/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">John Smith - Express Entry Consultation</h3>
                    <span className="text-sm text-gray-500">Uploaded yesterday</span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <Button size="sm" variant="outline">Download All</Button>
                    <Button size="sm" variant="outline">Preview</Button>
                  </div>
                  <textarea 
                    className="w-full border rounded-md p-3 text-sm"
                    rows={3}
                    placeholder="Add internal session notes here..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile & Calendar Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Settings</h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea 
                      className="w-full border border-gray-300 p-3 rounded-md"
                      rows={4}
                      defaultValue="Experienced RCIC with 8+ years helping international students and skilled workers navigate Canadian immigration."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                    <input 
                      className="w-full border border-gray-300 p-2 sm:p-3 rounded-md"
                      defaultValue="English, Mandarin, Cantonese"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                    <input 
                      className="w-full border border-gray-300 p-2 sm:p-3 rounded-md"
                      defaultValue="Express Entry, Study Permits, Work Permits"
                    />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">Update Profile</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Services & Pricing</h2>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">30-Minute Consultation</h3>
                      <span className="font-bold text-green-600">$60 CAD</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Quick guidance and general questions</p>
                    <Button size="sm" variant="outline">Edit Service</Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">File Review</h3>
                      <span className="font-bold text-green-600">$200 CAD</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Complete document analysis with preparation</p>
                    <Button size="sm" variant="outline">Edit Service</Button>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">Add New Service</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Calendar Integration</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Calendly URL</label>
                    <input 
                      className="w-full border border-gray-300 p-2 sm:p-3 rounded-md"
                      defaultValue="https://calendly.com/dr-sarah-chen"
                    />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">Update Calendar</Button>
                </div>
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
    </div>
  )
}
