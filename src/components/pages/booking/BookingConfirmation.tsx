import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../../ui/Card'
import { Button } from '../../Button'
import { 
  CheckCircle,
  Calendar,
  Clock,
  User,
  FileText,
  Mail,
  Video,
  Star,
  MapPin,
  Shield,
  Bell,
  Phone,
  Share2,
  Printer
} from 'lucide-react'

interface BookingConfirmationProps {
  bookingData: any
}

export function BookingConfirmation({ bookingData }: BookingConfirmationProps) {
  const navigate = useNavigate()

  // Generate confirmation number
  const confirmationNumber = 'RCIC-' + Math.random().toString(36).substr(2, 9).toUpperCase()

  // Mock Zoom link
  const zoomLink = 'https://zoom.us/j/123456789'

  const handleAddToCalendar = () => {
    // In a real app, this would generate a calendar file or use calendar APIs
    alert('Calendar invite would be generated here')
  }

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'RCIC Consultation Booking',
        text: `Booking confirmed for ${bookingData.service?.name} with ${bookingData.rcic?.name}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Booking link copied to clipboard!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          You're Booked! 🎉
        </h1>
        <p className="text-gray-600 text-lg">
          Your consultation has been successfully scheduled.
        </p>
      </div>

      {/* Confirmation Details */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Booking Confirmation</h2>
            <div className="text-right">
              <p className="text-sm text-gray-600">Confirmation #</p>
              <p className="font-mono font-semibold text-green-600">{confirmationNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Main Details */}
            <div className="space-y-4">
              {/* RCIC Details */}
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-blue-200/50">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {bookingData.rcic?.name?.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{bookingData.rcic?.name}</h3>
                  <p className="text-sm text-gray-600">License: {bookingData.rcic?.license}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{bookingData.rcic?.rating}</span>
                    <span className="text-sm text-gray-500">({bookingData.rcic?.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="p-4 bg-white rounded-lg border border-green-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-gray-900">Service</h4>
                </div>
                <p className="text-gray-800">{bookingData.service?.name}</p>
                <p className="text-sm text-gray-600">{bookingData.service?.duration}</p>
              </div>

              {/* Date & Time */}
              <div className="p-4 bg-white rounded-lg border border-purple-200/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900">{bookingData.timeSlot?.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900">{bookingData.timeSlot?.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-600">{bookingData.timezone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Actions & Info */}
            <div className="space-y-4">
              {/* Meeting Link */}
              <div className="p-4 bg-white rounded-lg border border-blue-200/50">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Meeting Details</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Join your consultation using the link below:
                </p>
                <Button
                  onClick={() => window.open(zoomLink, '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700 mb-2"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Zoom Meeting
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Meeting ID: 123-456-789
                </p>
              </div>

              {/* Payment Summary */}
              <div className="p-4 bg-white rounded-lg border border-green-200/50">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-gray-900">Payment Confirmed</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium">${bookingData.totalAmount} CAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono text-xs">{bookingData.payment?.id}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 bg-white rounded-lg border border-gray-200/50">
                <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddToCalendar}
                    className="flex items-center gap-1"
                  >
                    <Calendar className="h-4 w-4" />
                    Add to Calendar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareBooking}
                    className="flex items-center gap-1"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="flex items-center gap-1"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/client-dashboard')}
                    className="flex items-center gap-1"
                  >
                    <User className="h-4 w-4" />
                    Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What Happens Next?</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Email Confirmation</h4>
                <p className="text-sm text-gray-600">
                  You'll receive a detailed confirmation email with all booking information and meeting links within the next few minutes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-green-600">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Document Review</h4>
                <p className="text-sm text-gray-600">
                  Your RCIC will review the documents and intake form you submitted before your consultation session.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-purple-600">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Reminder Notifications</h4>
                <p className="text-sm text-gray-600">
                  You'll receive reminder emails 24 hours and 1 hour before your consultation session.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-orange-600">4</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Join Your Session</h4>
                <p className="text-sm text-gray-600">
                  Use the Zoom link provided to join your consultation at the scheduled time. Sessions typically start 2-3 minutes before the scheduled time.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Reminders */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-6 w-6 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">Important Reminders</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-amber-900">Before Your Session:</h4>
              <ul className="text-amber-800 space-y-1">
                <li>• Test your Zoom connection and audio/video</li>
                <li>• Prepare any additional questions you may have</li>
                <li>• Have a pen and paper ready for notes</li>
                <li>• Ensure you're in a quiet, private location</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-amber-900">Need to Make Changes?</h4>
              <ul className="text-amber-800 space-y-1">
                <li>• Reschedule at least 24 hours in advance</li>
                <li>• Contact support for urgent changes</li>
                <li>• Check your dashboard for booking management</li>
                <li>• Cancellations: Full refund if 48+ hours notice</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">Technical Support</p>
                <p className="text-gray-600">support@rcicplatform.com</p>
                <p className="text-gray-600">1-800-RCIC-HELP</p>
              </div>
              
              <div>
                <p className="font-medium text-gray-900">Booking Changes</p>
                <p className="text-gray-600">Available 24/7 through your dashboard</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => window.open('mailto:support@rcicplatform.com')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Privacy & Security</h3>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <p>Your consultation will be conducted with full confidentiality in accordance with RCIC professional standards.</p>
              
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900">Secure & Confidential</p>
                    <p className="text-green-700">All sessions are encrypted and your information remains private.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <Button
          onClick={() => navigate('/client-dashboard')}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Go to Dashboard
        </Button>
        
        <Button
          onClick={() => navigate('/consultants')}
          variant="outline"
          className="flex-1"
        >
          Book Another Session
        </Button>
        
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="flex-1"
        >
          Back to Home
        </Button>
      </div>
    </div>
  )
}
