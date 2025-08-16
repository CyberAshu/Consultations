import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../shared/Button'
import { Badge } from '../ui/Badge'
import { consultantService } from '../../services'
import {
  Star,
  MapPin,
  Languages,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  DollarSign,
  ChevronLeft,
  User,
  CheckCircle,
  MessageCircle,
  Globe,
  Video,
  FileText,
  Users,
  Zap
} from 'lucide-react'

interface Consultant {
  id: number
  name: string
  rcicNumber: string
  location: string
  timezone: string
  languages: string[]
  specialties: string[]
  rating: number
  reviewCount: number
  priceRange: string
  bio: string
  availability: string
  experience: string
  successRate: string
  profileImage?: string
  calendlyUrl?: string
  services: {
    id: number
    name: string
    duration: string
    price: string
    description: string
  }[]
  reviews: {
    id: number
    clientName: string
    rating: number
    comment: string
    date: string
    outcome?: string
  }[]
}

export function ConsultantProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'reviews'>('overview')
  const [consultant, setConsultant] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load consultant data and services
  useEffect(() => {
    const loadConsultantData = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Load consultant profile
        const consultantData = await consultantService.getConsultantById(parseInt(id))
        setConsultant(consultantData)
        
        // Load consultant services
        try {
          const servicesData = await consultantService.getConsultantServices(parseInt(id))
          setServices(servicesData)
        } catch (servicesError) {
          console.warn('Could not load services:', servicesError)
          setServices([])
        }
        
      } catch (err) {
        console.error('Failed to load consultant:', err)
        setError('Failed to load consultant profile. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadConsultantData()
  }, [id])

  // Navigation handlers
  const handleBookService = (service: any) => {
    window.open(`/book?rcic=${id}&service=${service.id}`, '_blank')
  }

  const handleBookGeneral = () => {
    window.open(`/book?rcic=${id}`, '_blank')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consultant profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Profile</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/consultants">
            <Button>Back to Consultants</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Not found state
  if (!consultant) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Consultant Not Found</h1>
          <Link to="/consultants">
            <Button>Back to Consultants</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link 
            to="/consultants" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Consultants
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-8">
                  {/* Profile Image */}
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold">
                      {consultant.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    {consultant.availability === "Available today" && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                        Available
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{consultant.name}</h1>
                    <p className="text-blue-600 font-semibold mb-3">RCIC #{consultant.rcicNumber}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                        <span>{consultant.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Globe className="h-5 w-5 mr-2 text-gray-400" />
                        <span>{consultant.timezone}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Languages className="h-5 w-5 mr-2 text-gray-400" />
                        <span>{consultant.languages.join(', ')}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-5 w-5 mr-2 text-gray-400" />
                        <span>{consultant.priceRange}</span>
                      </div>
                    </div>

                    {/* Rating and Stats */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                        <Star className="h-5 w-5 mr-2 fill-current" />
                        <span className="font-semibold">{consultant.rating}</span>
                        <span className="text-blue-500 ml-1">({consultant.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        <span className="font-semibold">{consultant.successRate} success rate</span>
                      </div>
                      <div className="flex items-center bg-purple-50 text-purple-700 px-4 py-2 rounded-lg">
                        <Award className="h-5 w-5 mr-2" />
                        <span className="font-semibold">{consultant.experience} experience</span>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">SPECIALTIES</h3>
                      <div className="flex flex-wrap gap-2">
                        {consultant.specialties.map((specialty: string) => (
                          <Badge 
                            key={specialty} 
                            variant="secondary" 
                            className="text-sm bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'services', label: 'Services & Pricing', icon: DollarSign },
                  { id: 'reviews', label: 'Reviews', icon: MessageCircle }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <Card>
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About {consultant.name}</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{consultant.bio}</p>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'services' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Services & Pricing</h2>
                  {services.length > 0 ? (
                    services.map((service) => (
                      <Card key={service.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                              <p className="text-gray-600 mb-3">{service.description}</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{service.duration_minutes ? `${service.duration_minutes} minutes` : 'Contact for details'}</span>
                              </div>
                            </div>
                            <div className="text-right ml-6">
                              <div className="text-2xl font-bold text-blue-600 mb-2">${service.price} CAD</div>
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleBookService(service)}
                              >
                                Book Now
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-gray-500">No services available at the moment. Please contact the consultant directly.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Client Reviews</h2>
                    <div className="text-sm text-gray-500">
                      {consultant.reviewCount} total reviews
                    </div>
                  </div>
                  
                  {consultant.reviews.map((review: any) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center mb-2">
                              <div className="font-semibold text-gray-900 mr-3">{review.clientName}</div>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">{review.date}</div>
                          </div>
                          {review.outcome && (
                            <Badge className="bg-green-50 text-green-700 border border-green-200">
                              {review.outcome}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Book a Consultation</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Licensed RCIC</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Secure video consultations</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Same-day availability</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 mb-3"
                  onClick={handleBookGeneral}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
                
                <Button variant="outline" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500 text-center">
                    Starting from <span className="font-semibold text-gray-900">$60 CAD</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Booking Times</h3>
                
                {/* Calendly Embed Placeholder */}
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">Interactive calendar will appear here</p>
                  <div className="text-sm text-gray-400">
                    Calendly integration: {consultant.calendlyUrl}
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Timezone: {consultant.timezone}</span>
                  </div>
                  <div className="flex items-center">
                    <Video className="h-4 w-4 mr-2" />
                    <span>Virtual consultations via Zoom</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
