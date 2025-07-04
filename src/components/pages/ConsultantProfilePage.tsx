import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../Button'
import { Badge } from '../ui/Badge'
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
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'reviews'>('overview')

  // Mock data - replace with actual API call
  const consultants: Consultant[] = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      rcicNumber: "R123456",
      location: "Toronto, ON",
      timezone: "EST (UTC-5)",
      languages: ["English", "Mandarin", "Cantonese"],
      specialties: ["Express Entry", "Study Permits", "Work Permits", "Family Sponsorship"],
      rating: 4.9,
      reviewCount: 127,
      priceRange: "$60 - $250",
      bio: "Experienced RCIC with 8+ years helping international students and skilled workers navigate Canadian immigration. Dr. Chen specializes in Express Entry applications and has successfully guided over 2,000 clients through their immigration journey. She holds a PhD in International Relations and is fluent in English, Mandarin, and Cantonese. Sarah is known for her patient approach and detailed explanations, making complex immigration processes easy to understand.",
      availability: "Available today",
      experience: "8+ years",
      successRate: "96%",
      calendlyUrl: "https://calendly.com/dr-sarah-chen",
      services: [
        {
          name: "30-Minute Consultation",
          duration: "30 min",
          price: "$60 CAD",
          description: "Quick guidance and general questions"
        },
        {
          name: "45-Minute Consultation", 
          duration: "45 min",
          price: "$85 CAD",
          description: "Detailed discussion and strategy planning"
        },
        {
          name: "File Review",
          duration: "60 min",
          price: "$200 CAD",
          description: "Complete document analysis with preparation"
        },
        {
          name: "File Review + Summary",
          duration: "60 min + written summary",
          price: "$250 CAD",
          description: "File review with detailed written follow-up"
        }
      ],
      reviews: [
        {
          id: 1,
          clientName: "Deepika K.",
          rating: 5,
          comment: "Dr. Chen was incredibly helpful with my study permit application. Her detailed explanation of the process and document requirements made everything clear. Highly recommend!",
          date: "2024-12-15",
          outcome: "Study Permit Approved"
        },
        {
          id: 2,
          clientName: "Michael L.",
          rating: 5,
          comment: "Excellent service! Sarah guided me through Express Entry and I received my ITA within 3 months. Her expertise in the system is outstanding.",
          date: "2024-12-10",
          outcome: "Express Entry ITA Received"
        },
        {
          id: 3,
          clientName: "Jennifer W.",
          rating: 4,
          comment: "Very knowledgeable and patient. The file review session helped me identify issues before submission. Professional and thorough.",
          date: "2024-12-05"
        }
      ]
    },
    {
      id: 2,
      name: "Ahmed Hassan",
      rcicNumber: "R234567",
      location: "Vancouver, BC",
      timezone: "PST (UTC-8)",
      languages: ["English", "Arabic", "French"],
      specialties: ["Family Sponsorship", "Refugee Claims", "Appeals", "Humanitarian Cases"],
      rating: 4.8,
      reviewCount: 89,
      priceRange: "$75 - $300",
      bio: "Ahmed Hassan is a dedicated immigration consultant with 12+ years of experience specializing in family reunification and humanitarian cases. He has successfully handled over 1,500 family sponsorship applications and is particularly skilled in complex refugee protection claims. Ahmed's compassionate approach and deep understanding of immigration law make him a trusted advisor for families seeking to reunite in Canada.",
      availability: "Available tomorrow",
      experience: "12+ years",
      successRate: "94%",
      calendlyUrl: "https://calendly.com/ahmed-hassan-rcic",
      services: [
        {
          name: "30-Minute Consultation",
          duration: "30 min",
          price: "$75 CAD",
          description: "Family sponsorship guidance"
        },
        {
          name: "60-Minute Consultation",
          duration: "60 min",
          price: "$120 CAD",
          description: "Complex case analysis"
        },
        {
          name: "File Review",
          duration: "90 min",
          price: "$250 CAD",
          description: "Comprehensive application review"
        },
        {
          name: "Appeal Consultation",
          duration: "60 min",
          price: "$300 CAD",
          description: "Appeal strategy and preparation"
        }
      ],
      reviews: [
        {
          id: 4,
          clientName: "Fatima A.",
          rating: 5,
          comment: "Ahmed helped reunite my family after years of separation. His expertise in family sponsorship is unmatched. Forever grateful!",
          date: "2024-12-12",
          outcome: "Family Reunification Successful"
        },
        {
          id: 5,
          clientName: "David M.",
          rating: 5,
          comment: "Professional and caring approach. Ahmed guided us through a complex sponsorship case with patience and expertise.",
          date: "2024-11-28",
          outcome: "Sponsorship Approved"
        }
      ]
    }
  ]

  const consultant = consultants.find(c => c.id === parseInt(id || ''))

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
                      {consultant.name.split(' ').map(n => n[0]).join('')}
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
                        {consultant.specialties.map((specialty) => (
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
                  {consultant.services.map((service, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                            <p className="text-gray-600 mb-3">{service.description}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{service.duration}</span>
                            </div>
                          </div>
                          <div className="text-right ml-6">
                            <div className="text-2xl font-bold text-blue-600 mb-2">{service.price}</div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                  
                  {consultant.reviews.map((review) => (
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

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 mb-3">
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
