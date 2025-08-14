import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../shared/Button'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { consultantApplicationService } from '../../services/consultantApplicationService'
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
  FileText,
  Eye,
  Check,
  X,
  Upload,
  Download,
  Save,
  Trash2,
  Paperclip,
  Mail
} from 'lucide-react'

export function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [consultantApplications, setConsultantApplications] = useState<any[]>([])
  const [applicationStats, setApplicationStats] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadConsultantApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      const applications = await consultantApplicationService.getApplications()
      setConsultantApplications(applications || [])
      
      // Calculate stats
      const total = applications.length
      const pending = applications.filter((app: any) => app.status === 'pending').length
      const approved = applications.filter((app: any) => app.status === 'approved').length
      const rejected = applications.filter((app: any) => app.status === 'rejected').length

      console.log({ total, pending, approved, rejected })
    } catch (error) {
      console.error('Error loading consultant applications:', error)
      setError('Failed to load consultant applications')
      // Keep dummy data as fallback
      setConsultantApplications(dummyConsultantApplications)
    } finally {
      setLoading(false)
    }
  }

  // Load consultant applications on component mount
  useEffect(() => {
    loadConsultantApplications()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleViewDetails = async (application: any) => {
    // Open modal with a spinner state using the known data, then fetch fresh data
    setSelectedApplication(application)
    setAdminNotes(application.admin_notes || '')
    setShowApplicationModal(true)
    try {
      setLoading(true)
      const fresh = await consultantApplicationService.getApplicationById(application.id)
      setSelectedApplication(fresh)
      setAdminNotes(fresh.admin_notes || '')
    } catch (e) {
      console.error('Failed to fetch latest application details', e)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowApplicationModal(false);
    setSelectedApplication(null);
  }

  const handleApproveApplication = async (applicationId: number) => {
    try {
      setLoading(true);
      await consultantApplicationService.approveApplication(applicationId);
      await loadConsultantApplications();
      if (selectedApplication && selectedApplication.id === applicationId) {
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error approving application:', error);
      setError('Failed to approve application');
    } finally {
      setLoading(false);
    }
  }

  const handleRejectApplication = async (applicationId: number) => {
    try {
      setLoading(true);
      await consultantApplicationService.rejectApplication(applicationId);
      await loadConsultantApplications();
      if (selectedApplication && selectedApplication.id === applicationId) {
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      setError('Failed to reject application');
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'users', label: 'User Management', icon: <Users className="h-4 w-4" /> },
    { id: 'consultants', label: 'RCIC Management', icon: <UserCheck className="h-4 w-4" /> },
    { id: 'applications', label: 'Applications', icon: <FileText className="h-4 w-4" /> },
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

  // Handler for uploading additional documents
  const handleUploadAdditionalDocument = async (file: File) => {
    if (!selectedApplication) return
    
    try {
      setUploading(true)
      await consultantApplicationService.uploadAdditionalDocument(selectedApplication.id, file)
      // Reload the application to get updated documents
      const updatedApplication = await consultantApplicationService.getApplicationById(selectedApplication.id)
      setSelectedApplication(updatedApplication)
      // Also reload the applications list
      await loadConsultantApplications()
    } catch (error) {
      console.error('Error uploading document:', error)
      setError('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  // Handler for requesting additional sections
  const handleRequestAdditionalSections = async (sections: number[]) => {
    if (!selectedApplication) return
    
    try {
      setLoading(true)
      await consultantApplicationService.requestAdditionalSections(selectedApplication.id, sections)
      
      // Reload the application to get updated data
      const updatedApplication = await consultantApplicationService.getApplicationById(selectedApplication.id)
      setSelectedApplication(updatedApplication)
      // Also reload the applications list
      await loadConsultantApplications()
      alert(`Additional sections have been requested from ${selectedApplication.full_legal_name || selectedApplication.email}. An email has been sent to ${selectedApplication.email} with a link to complete the remaining sections.`)
    } catch (error) {
      console.error('Error requesting additional sections:', error)
      setError('Failed to request additional sections')
    } finally {
      setLoading(false)
    }
  }

  // Handler for saving admin notes
  const handleSaveAdminNotes = async () => {
    if (!selectedApplication) return
    
    try {
      setLoading(true)
      await consultantApplicationService.updateAdminNotes(selectedApplication.id, adminNotes)
      // Update the selected application
      setSelectedApplication({ ...selectedApplication, admin_notes: adminNotes })
      // Also reload the applications list
      await loadConsultantApplications()
    } catch (error) {
      console.error('Error saving admin notes:', error)
      setError('Failed to save admin notes')
    } finally {
      setLoading(false)
    }
  }

  // Handler for deleting additional documents
  const handleDeleteAdditionalDocument = async (documentFilename: string) => {
    if (!selectedApplication) return
    
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return
    }
    
    try {
      setLoading(true)
      await consultantApplicationService.deleteAdditionalDocument(selectedApplication.id, documentFilename)
      // Reload the application to get updated documents
      const updatedApplication = await consultantApplicationService.getApplicationById(selectedApplication.id)
      setSelectedApplication(updatedApplication)
      // Also reload the applications list
      await loadConsultantApplications()
    } catch (error) {
      console.error('Error deleting document:', error)
      setError('Failed to delete document')
    } finally {
      setLoading(false)
    }
  }

  // Handler for file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload PDF, DOCX, JPG, or PNG files only.')
        return
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size too large. Maximum size is 10MB.')
        return
      }
      
      handleUploadAdditionalDocument(file)
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handler for sending credentials manually
  const handleSendCredentials = async () => {
    if (!selectedApplication) return
    
    if (!window.confirm(`Are you sure you want to send login credentials to ${selectedApplication.full_legal_name}?`)) {
      return
    }
    
    try {
      setLoading(true)
      const result = await consultantApplicationService.sendCredentials(selectedApplication.id)
      
      if (result.success) {
        alert(`✅ Success!\n\nCredentials have been sent to:\n${result.full_name} (${result.email})\n\nThe consultant will receive their login details via email.`)
      } else {
        alert(`❌ Failed to send credentials: ${result.message}`)
      }
    } catch (error: any) {
      console.error('Error sending credentials:', error)
      const errorMessage = error?.response?.data?.detail || error?.message || 'Unknown error occurred'
      alert(`❌ Error sending credentials: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Dummy data as fallback
  const dummyConsultantApplications = [
    { 
      id: 1, 
      fullLegalName: 'Dr. Emily Thompson', 
      email: 'emily.thompson@email.com',
      rcicLicenseNumber: 'R123789',
      ciccMembershipStatus: 'Active',
      cityProvince: 'Toronto, ON',
      timeZone: 'Eastern Time (ET)',
      status: 'pending',
      submittedAt: 'Jan 15, 2025'
    },
    { 
      id: 2, 
      fullLegalName: 'Michael Chen', 
      email: 'michael.chen@email.com',
      rcicLicenseNumber: 'R456123',
      ciccMembershipStatus: 'Active',
      cityProvince: 'Vancouver, BC',
      timeZone: 'Pacific Time (PT)',
      status: 'pending',
      submittedAt: 'Jan 14, 2025'
    },
    { 
      id: 3, 
      fullLegalName: 'Priya Sharma', 
      email: 'priya.sharma@email.com',
      rcicLicenseNumber: 'R789456',
      ciccMembershipStatus: 'Active',
      cityProvince: 'Calgary, AB',
      timeZone: 'Mountain Time (MT)',
      status: 'approved',
      submittedAt: 'Jan 12, 2025'
    },
    { 
      id: 4, 
      fullLegalName: 'James Wilson', 
      email: 'james.wilson@email.com',
      rcicLicenseNumber: 'R321654',
      ciccMembershipStatus: 'Under Review',
      cityProvince: 'Montreal, QC',
      timeZone: 'Eastern Time (ET)',
      status: 'rejected',
      submittedAt: 'Jan 10, 2025'
    }
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

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Loading State */}
            {loading && (
              <Card className="bg-white/90 backdrop-blur-lg shadow-md border-gray-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading consultant applications...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Error State */}
            {error && !loading && (
              <Card className="bg-white/90 backdrop-blur-lg shadow-md border-gray-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="h-6 w-6 text-red-600" />
                      </div>
                      <p className="text-red-600 font-medium mb-2">{error}</p>
                      <Button onClick={loadConsultantApplications} className="bg-purple-600 hover:bg-purple-700">
                        Try Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Main Content - Only show when not loading */}
            {!loading && (
              <>
                {/* Header with Stats and Actions */}
                <Card className="bg-white/90 backdrop-blur-lg shadow-md border-gray-200/50">
                  <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Consultant Applications</h2>
                    <p className="text-gray-500 mt-1">Review and manage RCIC consultant applications.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-auto">
                      <input 
                        type="text" 
                        placeholder="Search by name or license..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent w-full sm:w-64 transition-shadow shadow-sm"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <Button variant="outline" className="whitespace-nowrap w-full sm:w-auto">Export CSV</Button>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-yellow-50/70 p-4 rounded-lg border border-yellow-200/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-700 text-sm font-medium">Pending</p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {consultantApplications.filter(app => app.status === 'pending').length}
                        </p>
                      </div>
                      <Clock className="h-7 w-7 text-yellow-500 opacity-80" />
                    </div>
                  </div>
                  <div className="bg-green-50/70 p-4 rounded-lg border border-green-200/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-700 text-sm font-medium">Approved</p>
                        <p className="text-2xl font-bold text-green-900">
                          {consultantApplications.filter(app => app.status === 'approved').length}
                        </p>
                      </div>
                      <Check className="h-7 w-7 text-green-600 opacity-80" />
                    </div>
                  </div>
                  <div className="bg-red-50/70 p-4 rounded-lg border border-red-200/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-700 text-sm font-medium">Rejected</p>
                        <p className="text-2xl font-bold text-red-900">
                          {consultantApplications.filter(app => app.status === 'rejected').length}
                        </p>
                      </div>
                      <X className="h-7 w-7 text-red-600 opacity-80" />
                    </div>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-200/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Total</p>
                        <p className="text-2xl font-bold text-gray-800">{consultantApplications.length}</p>
                      </div>
                      <FileText className="h-7 w-7 text-gray-500 opacity-80" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Applications List */}
            <div className="space-y-4">
              {consultantApplications.map((app) => (
                <Card key={app.id} className="bg-white/80 backdrop-blur-sm shadow-md border-gray-200/50 hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Application Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-xl flex-shrink-0">
                                    {app.fullLegalName ? app.fullLegalName.charAt(0).toUpperCase() : app.full_legal_name ? app.full_legal_name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-800 truncate">{app.fullLegalName || app.full_legal_name || 'Unknown Name'}</h3>
                                    <p className="text-sm text-gray-500 truncate">{app.email || 'No email provided'}</p>
                                </div>
                            </div>
                            <Badge
                                className={`${app.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200/80' 
                                  : app.status === 'approved' 
                                  ? 'bg-green-100 text-green-800 border-green-200/80'
                                  : 'bg-red-100 text-red-800 border-red-200/80'
                                } whitespace-nowrap`}
                            >
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </Badge>
                        </div>
                        
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-gray-200/80 pt-4">
                          <div>
                            <p className="text-gray-500">License #</p>
                            <p className="text-gray-800 font-mono font-medium">{app.rcicLicenseNumber || app.rcic_license_number || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">CICC Status</p>
                            <p className="text-gray-800 font-medium">{app.ciccMembershipStatus || app.cicc_membership_status || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Location</p>
                            <p className="text-gray-800 font-medium">{app.cityProvince || app.city_province || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Submitted</p>
                            <p className="text-gray-800 font-medium">{app.submittedAt || app.submitted_at || app.created_at || 'N/A'}</p>
                          </div>
                        </div>
                        
                        {/* Section Completion Status */}
                        <div className="mt-4 pt-4 border-t border-gray-200/80">
                          <p className="text-sm text-gray-500 mb-2">Section Completion:</p>
                          <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5, 6, 7].map(sectionNum => {
                              const isCompleted = app[`section_${sectionNum}_completed`] === true;
                              return (
                                <span
                                  key={sectionNum}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    isCompleted 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {sectionNum}
                                  {isCompleted && (
                                    <Check className="h-3 w-3 ml-1" />
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="border-t lg:border-t-0 lg:border-l border-gray-200/80 flex-shrink-0 lg:pl-4 pt-4 lg:pt-0">
                          <div className="flex flex-col gap-2 w-full lg:w-48">
                            <Button size="sm" variant="outline" className="flex items-center justify-center gap-2 w-full" onClick={() => handleViewDetails(app)}>
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                            {app.status === 'pending' && (
                              <>
                                {/* Request Additional Sections Button - Only show if only Section 1 is completed */}
                                {app.section_1_completed === true && 
                                 app.section_2_completed !== true && 
                                 app.section_3_completed !== true && 
                                 app.section_4_completed !== true && 
                                 app.section_5_completed !== true && 
                                 app.section_6_completed !== true && 
                                 app.section_7_completed !== true && (
                                  <Button 
                                    size="sm" 
                                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2 w-full"
                                    onClick={() => handleRequestAdditionalSections([2, 3, 4, 5, 6, 7])}
                                    disabled={loading}
                                  >
                                    <Mail className="h-4 w-4" />
                                    {loading ? 'Requesting...' : 'Request Sections'}
                                  </Button>
                                )}
                                
                                {/* Approve Profile Button - Only show if all sections are completed */}
                                {app.section_1_completed === true && 
                                 app.section_2_completed === true && 
                                 app.section_3_completed === true && 
                                 app.section_4_completed === true && 
                                 app.section_5_completed === true && 
                                 app.section_6_completed === true && 
                                 app.section_7_completed === true && (
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 w-full"
                                    onClick={() => handleApproveApplication(app.id)}
                                    disabled={loading}
                                  >
                                    <Check className="h-4 w-4" />
                                    {loading ? 'Approving...' : 'Approve Profile'}
                                  </Button>
                                )}
                                
                                <Button 
                                  size="sm" 
                                  className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 w-full"
                                  onClick={() => handleRejectApplication(app.id)}
                                  disabled={loading}
                                >
                                  <X className="h-4 w-4" />
                                  {loading ? 'Rejecting...' : 'Reject'}
                                </Button>
                              </>
                            )}
                          </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
              </>
            )}
          </div>
        )}
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
      
      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">RCIC Application Review</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-gray-600">Application ID: #{selectedApplication.id}</p>
                    <Badge
                      className={(
                        selectedApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        selectedApplication.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                        selectedApplication.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      )}
                    >
                      {selectedApplication.status?.charAt(0).toUpperCase() + selectedApplication.status?.slice(1)}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  
                  {/* Section 1: Personal & Contact Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Personal & Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Legal Name</label>
                        <p className="mt-1 text-sm text-gray-900 font-medium">{selectedApplication.full_legal_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Preferred Display Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.preferred_display_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedApplication.email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Mobile Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.mobile_phone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.date_of_birth || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City, Province</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.city_province || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time Zone</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.time_zone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Licensing & Credentials */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Licensing & Credentials
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">RCIC License Number</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">{selectedApplication.rcic_license_number || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Year of Initial Licensing</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.year_of_initial_licensing || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">CICC Membership Status</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.cicc_membership_status || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Practice Details */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Practice Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Practice Type</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.practice_type || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business/Firm Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.business_firm_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Website/LinkedIn</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.website_linkedin || 'N/A'}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 w-48">Canadian Business Registration:</span>
                          <Badge className={selectedApplication.canadian_business_registration ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedApplication.canadian_business_registration ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 w-48">IRB Authorization:</span>
                          <Badge className={selectedApplication.irb_authorization ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedApplication.irb_authorization ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 w-48">Taking Clients (Private Practice):</span>
                          <Badge className={selectedApplication.taking_clients_private_practice ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedApplication.taking_clients_private_practice ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 w-48">Representing Clients (IRCC/IRB):</span>
                          <Badge className={selectedApplication.representing_clients_ircc_irb ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedApplication.representing_clients_ircc_irb ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Areas of Expertise */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Areas of Expertise
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expertise Areas</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.areas_of_expertise && Array.isArray(selectedApplication.areas_of_expertise) 
                            ? selectedApplication.areas_of_expertise.map((area: string, index: number) => (
                              <Badge key={index} className="bg-orange-100 text-orange-800 text-xs">
                                {area}
                              </Badge>
                            ))
                            : <p className="text-sm text-gray-500">No expertise areas specified</p>
                          }
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Other Expertise</label>
                        <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded border">{selectedApplication.other_expertise || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  
                  {/* Section 5: Languages */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Languages Spoken
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Primary Language</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.primary_language || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Other Languages</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.other_languages && Array.isArray(selectedApplication.other_languages) 
                            ? selectedApplication.other_languages.map((lang: string, index: number) => (
                              <Badge key={index} className="bg-indigo-100 text-indigo-800 text-xs">
                                {lang}
                              </Badge>
                            ))
                            : <p className="text-sm text-gray-500">No additional languages specified</p>
                          }
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 w-48">Multilingual Consultations:</span>
                        <Badge className={selectedApplication.multilingual_consultations ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedApplication.multilingual_consultations ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Documents */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Uploaded Documents
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <p className="text-sm font-medium text-gray-900">CICC Register Screenshot</p>
                            <p className="text-xs text-gray-500">{selectedApplication.cicc_register_screenshot_url || 'Not provided'}</p>
                          </div>
{selectedApplication.cicc_register_screenshot_url && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs" 
                              onClick={() => consultantApplicationService.viewDocument(selectedApplication.cicc_register_screenshot_url)}
                            >
                              View
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Proof of Good Standing</p>
                            <p className="text-xs text-gray-500">{selectedApplication.proof_of_good_standing_url || 'Not provided'}</p>
                          </div>
{selectedApplication.proof_of_good_standing_url && (
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => consultantApplicationService.viewDocument(selectedApplication.proof_of_good_standing_url)}>
                              View
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Insurance Certificate</p>
                            <p className="text-xs text-gray-500">{selectedApplication.insurance_certificate_url || 'Not provided'}</p>
                          </div>
{selectedApplication.insurance_certificate_url && (
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => consultantApplicationService.viewDocument(selectedApplication.insurance_certificate_url)}>
                              View
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Government ID</p>
                            <p className="text-xs text-gray-500">{selectedApplication.government_id_url || 'Not provided'}</p>
                          </div>
{selectedApplication.government_id_url && (
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => consultantApplicationService.viewDocument(selectedApplication.government_id_url)}>
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 7: Declarations & Agreements */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      Declarations & Agreements
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 flex-1">Confirmed Licensed RCIC:</span>
                        <Badge className={selectedApplication.confirm_licensed_rcic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedApplication.confirm_licensed_rcic ? 'Confirmed' : 'Not Confirmed'}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 flex-1">Agreed to Terms & Guidelines:</span>
                        <Badge className={selectedApplication.agree_terms_guidelines ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedApplication.agree_terms_guidelines ? 'Agreed' : 'Not Agreed'}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 flex-1">Agreed to Compliance IRPA:</span>
                        <Badge className={selectedApplication.agree_compliance_irpa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedApplication.agree_compliance_irpa ? 'Agreed' : 'Not Agreed'}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 flex-1">Agreed No Outside Contact:</span>
                        <Badge className={selectedApplication.agree_no_outside_contact ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedApplication.agree_no_outside_contact ? 'Agreed' : 'Not Agreed'}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 flex-1">Consent to Session Reviews:</span>
                        <Badge className={selectedApplication.consent_session_reviews ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedApplication.consent_session_reviews ? 'Consented' : 'Not Consented'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Section 8: Signature & Submission */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Signature & Submission
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Digital Signature Name</label>
                        <p className="mt-1 text-sm text-gray-900 bg-white px-2 py-1 rounded border font-mono">{selectedApplication.digital_signature_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Submission Date</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.submission_date || selectedApplication.created_at || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Documents Section */}
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-pink-900 mb-4 flex items-center gap-2">
                      <Paperclip className="h-5 w-5" />
                      Additional Documents (Admin Only)
                    </h3>
                    
                    {/* Upload Section */}
                    <div className="mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileInputChange}
                          accept=".pdf,.docx,.jpg,.jpeg,.png"
                          className="hidden"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => fileInputRef.current?.click()} 
                          disabled={uploading}
                          className="bg-pink-600 hover:bg-pink-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploading ? 'Uploading...' : 'Upload Document'}
                        </Button>
                        <span className="text-xs text-gray-500">PDF, DOCX, JPG, PNG (max 10MB)</span>
                      </div>
                    </div>
                    
                    {/* Additional Documents List */}
                    <div className="space-y-2">
                      {selectedApplication.additional_documents && selectedApplication.additional_documents.length > 0 ? (
                        selectedApplication.additional_documents.map((doc: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{doc.original_name}</p>
                              <p className="text-xs text-gray-500">
                                Uploaded by {doc.uploader_email} on {doc.timestamp ? new Date(doc.timestamp).toLocaleDateString() : 'Unknown date'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs" 
                                onClick={() => consultantApplicationService.viewDocument(doc.file_path)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-red-600 hover:bg-red-700 text-xs" 
                                onClick={() => handleDeleteAdditionalDocument(doc.filename)}
                                disabled={loading}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 bg-white p-3 rounded border text-center">No additional documents uploaded</p>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Admin Notes
                    </h3>
                    <textarea 
                      className="w-full border border-gray-300 rounded-md p-3 text-sm min-h-[100px]"
                      placeholder="Add internal notes about this application..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                    <div className="mt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveAdminNotes}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Notes'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setAdminNotes(selectedApplication.admin_notes || '')}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Admin Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {selectedApplication.status === 'pending' && (
                    <>
                      {/* Request Additional Sections Button - Only show if only Section 1 is completed */}
                      {selectedApplication.section_1_completed === true && 
                       selectedApplication.section_2_completed !== true && 
                       selectedApplication.section_3_completed !== true && 
                       selectedApplication.section_4_completed !== true && 
                       selectedApplication.section_5_completed !== true && 
                       selectedApplication.section_6_completed !== true && 
                       selectedApplication.section_7_completed !== true && (
                        <Button 
                          className="bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2"
                          onClick={() => handleRequestAdditionalSections([2, 3, 4, 5, 6, 7])}
                          disabled={loading}
                        >
                          <Mail className="h-4 w-4" />
                          {loading ? 'Requesting...' : 'Request Additional Sections'}
                        </Button>
                      )}
                      
                                             {/* Approve Profile Button - Only show if all sections are completed */}
                       {selectedApplication.section_1_completed === true && 
                        selectedApplication.section_2_completed === true && 
                        selectedApplication.section_3_completed === true && 
                        selectedApplication.section_4_completed === true && 
                        selectedApplication.section_5_completed === true && 
                        selectedApplication.section_6_completed === true && 
                        selectedApplication.section_7_completed === true && (
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                          onClick={() => handleApproveApplication(selectedApplication.id)}
                          disabled={loading}
                        >
                          <Check className="h-4 w-4" />
                          {loading ? 'Approving...' : 'Approve Profile'}
                        </Button>
                      )}
                      
                      <Button 
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                        onClick={() => handleRejectApplication(selectedApplication.id)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                        {loading ? 'Rejecting...' : 'Reject Application'}
                      </Button>
                    </>
                  )}
                  
                  {/* Send Credentials Button - Available for approved applications */}
                  {selectedApplication.status === 'approved' && (
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
                      onClick={handleSendCredentials}
                      disabled={loading}
                    >
                      <Mail className="h-4 w-4" />
                      {loading ? 'Sending...' : 'Send ID & Password'}
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button variant="outline" onClick={handleCloseModal} className="flex-1 sm:flex-none">
                    Close
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none">
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
