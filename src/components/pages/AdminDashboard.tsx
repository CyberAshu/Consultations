import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../shared/Button'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  UserCheck, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Shield,
  LogOut,
  ArrowLeft,
  Bell,
  Crown,
  Activity
} from 'lucide-react'

export function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'users', label: 'User Management', icon: <Users className="h-4 w-4" /> },
    { id: 'consultants', label: 'RCIC Management', icon: <UserCheck className="h-4 w-4" /> },
    { id: 'bookings', label: 'Bookings', icon: <Calendar className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> }
  ]

  const stats = [
    { label: 'Total Users', value: '2,847', change: '+12%', color: 'blue' },
    { label: 'Active RCICs', value: '23', change: '+2', color: 'green' },
    { label: 'Monthly Revenue', value: '$47,320', change: '+18%', color: 'purple' },
    { label: 'Sessions Today', value: '47', change: '+8', color: 'orange' }
  ]

  const recentUsers = [
    { id: 1, name: 'John Smith', email: 'john@example.com', status: 'Active', joinDate: 'Dec 15, 2024' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', status: 'Active', joinDate: 'Dec 14, 2024' },
    { id: 3, name: 'Mike Chen', email: 'mike@example.com', status: 'Pending', joinDate: 'Dec 13, 2024' },
    { id: 4, name: 'Lisa Wang', email: 'lisa@example.com', status: 'Active', joinDate: 'Dec 12, 2024' }
  ]

  const rcics = [
    { id: 1, name: 'Dr. Sarah Chen', license: 'R123456', status: 'Verified', rating: 4.9, sessions: 127 },
    { id: 2, name: 'Ahmed Hassan', license: 'R234567', status: 'Verified', rating: 4.8, sessions: 89 },
    { id: 3, name: 'Maria Rodriguez', license: 'R345678', status: 'Pending', rating: 5.0, sessions: 156 },
    { id: 4, name: 'Jean-Pierre Dubois', license: 'R456789', status: 'Verified', rating: 4.7, sessions: 94 }
  ]

  const recentBookings = [
    { id: 1, client: 'John Smith', rcic: 'Dr. Sarah Chen', service: 'Express Entry', date: 'Dec 16, 2024', status: 'Confirmed' },
    { id: 2, client: 'Sarah Johnson', rcic: 'Ahmed Hassan', service: 'Document Review', date: 'Dec 16, 2024', status: 'Pending' },
    { id: 3, client: 'Mike Chen', rcic: 'Maria Rodriguez', service: 'PNP Consultation', date: 'Dec 15, 2024', status: 'Completed' },
    { id: 4, client: 'Lisa Wang', rcic: 'Jean-Pierre Dubois', service: 'Study Permit', date: 'Dec 15, 2024', status: 'Cancelled' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50/30 to-red-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 bg-white/60 border-purple-200 text-purple-700 hover:bg-purple-50 px-3 py-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Website</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Admin Dashboard
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">System Administration Panel</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-xs sm:text-sm text-green-600 font-medium">All Systems Operational</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="relative bg-white/60 border-gray-200 hover:bg-gray-50"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">5</span>
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
                    ? 'border-purple-500 text-purple-600 bg-purple-50/50'
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50 hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-xs sm:text-sm text-${stat.color}-600`}>{stat.change} from last month</p>
                      </div>
                      <div className={`p-2 sm:p-3 bg-${stat.color}-100 rounded-lg flex-shrink-0 ml-2`}>
                        <TrendingUp className={`h-4 w-4 sm:h-6 sm:w-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent User Registrations</h3>
                  <div className="space-y-3">
                    {recentUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <Badge className={user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {user.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Alerts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="text-yellow-800">3 RCICs pending verification</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800">System maintenance scheduled for tonight</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-green-800">Revenue increased 18% this month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">User Management</h2>
                <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">Add New User</Button>
              </div>
              
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">{user.joinDate}</p>
                      </div>
                      <Badge className={user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {user.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="flex-1 min-w-0">View</Button>
                      <Button size="sm" variant="outline" className="flex-1 min-w-0">Edit</Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 flex-1 min-w-0">Suspend</Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-gray-700 whitespace-nowrap">Name</th>
                      <th className="text-left p-3 text-gray-700 whitespace-nowrap">Email</th>
                      <th className="text-left p-3 text-gray-700 whitespace-nowrap">Status</th>
                      <th className="text-left p-3 text-gray-700 whitespace-nowrap">Join Date</th>
                      <th className="text-left p-3 text-gray-700 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-3 font-medium">{user.name}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">
                          <Badge className={user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-3">{user.joinDate}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            <Button size="sm" variant="outline">View</Button>
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">Suspend</Button>
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

        {/* RCIC Management Tab */}
        {activeTab === 'consultants' && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">RCIC Management</h2>
                <Button className="bg-green-600 hover:bg-green-700">Add New RCIC</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-gray-700">Name</th>
                      <th className="text-left p-3 text-gray-700">License #</th>
                      <th className="text-left p-3 text-gray-700">Status</th>
                      <th className="text-left p-3 text-gray-700">Rating</th>
                      <th className="text-left p-3 text-gray-700">Sessions</th>
                      <th className="text-left p-3 text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rcics.map((rcic) => (
                      <tr key={rcic.id} className="border-b">
                        <td className="p-3 font-medium">{rcic.name}</td>
                        <td className="p-3">{rcic.license}</td>
                        <td className="p-3">
                          <Badge className={rcic.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {rcic.status}
                          </Badge>
                        </td>
                        <td className="p-3">{rcic.rating} ★</td>
                        <td className="p-3">{rcic.sessions}</td>
                        <td className="p-3 space-x-2">
                          <Button size="sm" variant="outline">View Profile</Button>
                          {rcic.status === 'Pending' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">Verify</Button>
                          )}
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">Suspend</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Booking Management</h2>
                <div className="flex gap-2">
                  <Button variant="outline">Export Data</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">Manual Booking</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-gray-700">Client</th>
                      <th className="text-left p-3 text-gray-700">RCIC</th>
                      <th className="text-left p-3 text-gray-700">Service</th>
                      <th className="text-left p-3 text-gray-700">Date</th>
                      <th className="text-left p-3 text-gray-700">Status</th>
                      <th className="text-left p-3 text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b">
                        <td className="p-3 font-medium">{booking.client}</td>
                        <td className="p-3">{booking.rcic}</td>
                        <td className="p-3">{booking.service}</td>
                        <td className="p-3">{booking.date}</td>
                        <td className="p-3">
                          <Badge className={
                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {booking.status}
                          </Badge>
                        </td>
                        <td className="p-3 space-x-2">
                          <Button size="sm" variant="outline">View Details</Button>
                          <Button size="sm" variant="outline">Edit</Button>
                          {booking.status === 'Pending' && (
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">Cancel</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900">Total Revenue</h3>
                    <p className="text-2xl font-bold text-blue-600">$127,840</p>
                    <p className="text-sm text-blue-700">+22% from last quarter</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900">Sessions Completed</h3>
                    <p className="text-2xl font-bold text-green-600">1,234</p>
                    <p className="text-sm text-green-700">+15% from last quarter</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-purple-900">Avg Session Rating</h3>
                    <p className="text-2xl font-bold text-purple-600">4.8</p>
                    <p className="text-sm text-purple-700">+0.2 from last quarter</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Type Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Express Entry Consultations</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Document Reviews</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Study Permit Consultations</span>
                    <span className="font-medium">22%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '22%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Other Services</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">System Settings</h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform Commission (%)</label>
                    <input className="w-full border border-gray-300 p-2 rounded-md" defaultValue="15" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Session Duration (minutes)</label>
                    <input className="w-full border border-gray-300 p-2 rounded-md" defaultValue="30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Cancellation Time (hours)</label>
                    <input className="w-full border border-gray-300 p-2 rounded-md" defaultValue="24" />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">Save Settings</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Email Templates</h2>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Booking Confirmation</h3>
                    <Button size="sm" variant="outline">Edit Template</Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Session Reminder</h3>
                    <Button size="sm" variant="outline">Edit Template</Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">RCIC Verification</h3>
                    <Button size="sm" variant="outline">Edit Template</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
