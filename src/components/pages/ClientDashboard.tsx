import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../Button'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
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
  Search,
  Filter
} from 'lucide-react'

export function ClientDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const tabs = [
    { id: 'dashboard', label: 'Home / Dashboard', icon: <Home className="h-4 w-4" /> },
    { id: 'bookings', label: 'My Bookings', icon: <Calendar className="h-4 w-4" /> },
    { id: 'documents', label: 'My Documents', icon: <FileText className="h-4 w-4" /> },
    { id: 'settings', label: 'Account Settings', icon: <Settings className="h-4 w-4" /> }
  ]

  const upcomingSessions = [
    { id: 1, rcic: 'Dr. Sarah Chen', service: 'Express Entry Consultation', date: 'Dec 16, 2024', time: '2:00 PM', status: 'confirmed' },
    { id: 2, rcic: 'Ahmed Hassan', service: 'Document Review', date: 'Dec 18, 2024', time: '10:00 AM', status: 'confirmed' }
  ]

  const pastSessions = [
    { id: 3, rcic: 'Maria Rodriguez', service: 'PNP Consultation', date: 'Dec 10, 2024', time: '3:00 PM', status: 'completed' },
    { id: 4, rcic: 'Jean-Pierre Dubois', service: 'Study Permit Consultation', date: 'Nov 28, 2024', time: '11:00 AM', status: 'completed' }
  ]

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
                  <p className="text-gray-600 text-sm sm:text-base">Welcome back, John Smith</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
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
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back, John!</h2>
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
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="border border-blue-200/50 rounded-xl p-4 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{session.service}</h4>
                          <p className="text-sm text-gray-600">with {session.rcic}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="h-4 w-4" />
                            {session.date} at {session.time}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {session.status}
                        </Badge>
                      </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-shrink-0">
                      <Video className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Join Session</span>
                      <span className="sm:hidden">Join</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-shrink-0">
                      <span className="hidden sm:inline">Reschedule</span>
                      <span className="sm:hidden">Reschedule</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-shrink-0">
                      Cancel
                    </Button>
                  </div>
                    </div>
                  ))}
                  {upcomingSessions.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No upcoming sessions scheduled</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Button className="bg-green-600 hover:bg-green-700 h-12 sm:h-14 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Book New Session</span>
                    <span className="sm:hidden">Book Session</span>
                  </Button>
                  <Button variant="outline" className="h-12 sm:h-14 text-sm sm:text-base font-medium border-2 border-blue-200 text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Request Summary</span>
                    <span className="sm:hidden">Summary</span>
                  </Button>
                  <Button variant="outline" className="h-12 sm:h-14 text-sm sm:text-base font-medium border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all duration-200 col-span-1 sm:col-span-2 lg:col-span-1">
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
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{session.service}</h4>
                          <p className="text-sm text-gray-600">with {session.rcic}</p>
                          <p className="text-sm text-gray-500">{session.date} at {session.time}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1 min-w-0">Join</Button>
                        <Button size="sm" variant="outline" className="flex-1 min-w-0">Reschedule</Button>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 flex-1 min-w-0">Cancel</Button>
                      </div>
                    </div>
                  ))}
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
                      {upcomingSessions.map((session) => (
                        <tr key={session.id} className="border-b">
                          <td className="p-3 font-medium">{session.service}</td>
                          <td className="p-3">{session.rcic}</td>
                          <td className="p-3">{session.date} {session.time}</td>
                          <td className="p-3">
                            <Badge className="bg-green-100 text-green-800">
                              {session.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Join</Button>
                              <Button size="sm" variant="outline">Reschedule</Button>
                              <Button size="sm" className="bg-red-600 hover:bg-red-700">Cancel</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Past Bookings */}
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Past Sessions</h3>
                
                {/* Mobile Card View */}
                <div className="block lg:hidden space-y-4">
                  {pastSessions.map((session) => (
                    <div key={session.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{session.service}</h4>
                          <p className="text-sm text-gray-600">with {session.rcic}</p>
                          <p className="text-sm text-gray-500">{session.date} at {session.time}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="flex-1 min-w-0">View Summary</Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1 min-w-0">Rebook</Button>
                      </div>
                    </div>
                  ))}
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
                      {pastSessions.map((session) => (
                        <tr key={session.id} className="border-b">
                          <td className="p-3 font-medium">{session.service}</td>
                          <td className="p-3">{session.rcic}</td>
                          <td className="p-3">{session.date} {session.time}</td>
                          <td className="p-3">
                            <Badge className="bg-blue-100 text-blue-800">
                              {session.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              <Button size="sm" variant="outline">View Summary</Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">Rebook</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">My Documents</h2>
                
                {/* Upload Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h3>
                  <div className="border-2 border-dashed border-blue-300/50 rounded-xl p-8 text-center bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:border-blue-400/70 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Drag and drop files here, or click to select files</p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Choose Files
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-gray-200/50 rounded-xl bg-gradient-to-r from-white to-gray-50/50 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Passport Copy.pdf</p>
                          <p className="text-sm text-gray-500">Uploaded Dec 10, 2024</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200/50 rounded-xl bg-gradient-to-r from-white to-gray-50/50 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Education Credentials.pdf</p>
                          <p className="text-sm text-gray-500">Uploaded Dec 8, 2024</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Account Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input 
                        className="w-full border border-gray-300 p-2 sm:p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        type="text"
                        defaultValue="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input 
                        className="w-full border border-gray-300 p-2 sm:p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        type="text"
                        defaultValue="Smith"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      className="w-full border border-gray-300 p-2 sm:p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="email"
                      defaultValue="john.smith@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input 
                      className="w-full border border-gray-300 p-2 sm:p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="text"
                      defaultValue="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language Preference</label>
                    <select className="w-full border border-gray-300 p-2 sm:p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>English</option>
                      <option>French</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input 
                      className="w-full border border-gray-300 p-2 sm:p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="password"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                  
                  <Button className="bg-blue-600 hover:bg-blue-700 px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">
                    Update Settings
                  </Button>
                </form>
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
    </div>
  )
}
