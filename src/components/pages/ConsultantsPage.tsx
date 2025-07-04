import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../Button'
import { Badge } from '../ui/Badge'
import {
  Star,
  MapPin,
  Languages,
  DollarSign,
  Filter,
  X,
  Clock,
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

export function ConsultantsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const consultants: Consultant[] = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      rcicNumber: "R123456",
      location: "Toronto, ON",
      timezone: "EST (UTC-5)",
      languages: ["English", "Mandarin", "Cantonese"],
      specialties: ["Express Entry", "Study Permits", "Work Permits"],
      rating: 4.9,
      reviewCount: 127,
      priceRange: "$60 - $250",
      bio: "Experienced RCIC with 8+ years helping international students and skilled workers navigate Canadian immigration. Specializes in Express Entry and study permit applications.",
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
      specialties: ["Family Sponsorship", "Refugee Claims", "Appeals"],
      rating: 4.8,
      reviewCount: 89,
      priceRange: "$75 - $300",
      bio: "Dedicated to helping families reunite in Canada. Extensive experience with complex family sponsorship cases and refugee protection claims.",
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
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      rcicNumber: "R345678",
      location: "Calgary, AB",
      timezone: "MST (UTC-7)",
      languages: ["English", "Spanish"],
      specialties: ["Provincial Nominee Program", "Work Permits", "PR Applications"],
      rating: 5.0,
      reviewCount: 156,
      priceRange: "$60 - $250",
      bio: "PNP specialist with deep knowledge of Alberta and Saskatchewan immigration programs. Helps skilled workers achieve permanent residence.",
      availability: "Available in 2 days",
      experience: "10+ years",
      successRate: "98%",
      calendlyUrl: "https://calendly.com/maria-rodriguez-rcic",
      services: [
        {
          name: "PNP Assessment",
          duration: "45 min",
          price: "$80 CAD",
          description: "Provincial Nominee Program evaluation"
        },
        {
          name: "Work Permit Consultation",
          duration: "60 min",
          price: "$120 CAD",
          description: "Work permit application guidance"
        },
        {
          name: "PR Application Review",
          duration: "90 min",
          price: "$200 CAD",
          description: "Complete PR application assessment"
        },
        {
          name: "Full Service Package",
          duration: "Multiple sessions",
          price: "$250 CAD",
          description: "End-to-end immigration support"
        }
      ],
      reviews: [
        {
          id: 6,
          clientName: "Carlos S.",
          rating: 5,
          comment: "Maria's expertise in PNP was exactly what I needed. She guided me through the Alberta PNP process and I got my nomination!",
          date: "2024-12-08",
          outcome: "PNP Nomination Received"
        },
        {
          id: 7,
          clientName: "Ana L.",
          rating: 5,
          comment: "Outstanding service! Maria made the complex PR process seem easy. Highly professional and responsive.",
          date: "2024-11-25",
          outcome: "PR Application Approved"
        }
      ]
    },
    {
      id: 4,
      name: "Jean-Pierre Dubois",
      rcicNumber: "R456789",
      location: "Montreal, QC",
      timezone: "EST (UTC-5)",
      languages: ["English", "French"],
      specialties: ["Quebec Immigration", "Francophone Programs", "Business Immigration"],
      rating: 4.7,
      reviewCount: 94,
      priceRange: "$60 - $250",
      bio: "Quebec immigration expert fluent in both official languages. Specializes in Quebec-specific programs and francophone immigration pathways.",
      availability: "Available today",
      experience: "15+ years",
      successRate: "92%",
      calendlyUrl: "https://calendly.com/jean-pierre-dubois",
      services: [
        {
          name: "Quebec Immigration Consultation",
          duration: "60 min",
          price: "$100 CAD",
          description: "Quebec-specific immigration guidance"
        },
        {
          name: "Business Immigration Planning",
          duration: "90 min",
          price: "$150 CAD",
          description: "Entrepreneur and investor programs"
        },
        {
          name: "Francophone Program Assessment",
          duration: "45 min",
          price: "$80 CAD",
          description: "French-speaking immigration pathways"
        },
        {
          name: "Complete File Review",
          duration: "120 min",
          price: "$250 CAD",
          description: "Comprehensive application review and strategy"
        }
      ],
      reviews: [
        {
          id: 8,
          clientName: "Marie C.",
          rating: 5,
          comment: "Jean-Pierre's knowledge of Quebec immigration is exceptional. He helped me navigate the CSQ process smoothly.",
          date: "2024-12-01",
          outcome: "CSQ Approved"
        },
        {
          id: 9,
          clientName: "Philippe R.",
          rating: 4,
          comment: "Professional and knowledgeable. Jean-Pierre provided excellent guidance for my business immigration case.",
          date: "2024-11-20",
          outcome: "Business Application Approved"
        }
      ]
    },
  ]

  // Filter consultants based on search and filters
  const filteredConsultants = consultants.filter(consultant => {
    const matchesSearch = searchTerm === "" || 
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      consultant.languages.some(l => l.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesLanguage = !selectedLanguage || consultant.languages.includes(selectedLanguage)
    const matchesProvince = !selectedProvince || consultant.location.includes(selectedProvince)
    const matchesSpecialty = !selectedSpecialty || consultant.specialties.includes(selectedSpecialty)

    return matchesSearch && matchesLanguage && matchesProvince && matchesSpecialty
  })

  // Get unique values for filters
  const uniqueLanguages = Array.from(new Set(consultants.flatMap(c => c.languages))).sort()
  const uniqueProvinces = Array.from(new Set(consultants.map(c => c.location.split(", ")[1]))).sort()
  const uniqueSpecialties = Array.from(new Set(consultants.flatMap(c => c.specialties))).sort()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 pt-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Licensed Immigration Consultants</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">Find the right RCIC for your immigration needs</p>
        </div>

        {/* Search and Filters */}
        <div className="container mx-auto px-4 mt-8">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by name, specialty, or language..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Filters */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Language Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">All Languages</option>
                  {uniqueLanguages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Province Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Province</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">All Provinces</option>
                  {uniqueProvinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              {/* Specialty Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Specialty</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">All Specialties</option>
                  {uniqueSpecialties.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultants Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredConsultants.length > 0 
                ? `Found ${filteredConsultants.length} consultant${filteredConsultants.length !== 1 ? 's' : ''}` 
                : 'No consultants found'}
            </h2>
            {(searchTerm || selectedLanguage || selectedProvince || selectedSpecialty) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedLanguage("")
                  setSelectedProvince("")
                  setSelectedSpecialty("")
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredConsultants.map((consultant) => (
              <Card 
                key={consultant.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <CardContent className="p-4 sm:p-6">
                  {/* Consultant Header */}
                  <div className="text-center mb-4">
                    {/* Photo */}
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {consultant.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {consultant.availability === "Available today" && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          Available
                        </div>
                      )}
                    </div>
                    
                    {/* Name & RCIC # */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{consultant.name}</h3>
                    <p className="text-sm text-blue-600 font-medium mb-3">RCIC #{consultant.rcicNumber}</p>
                  </div>

                  {/* Specialty Tags */}
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {consultant.specialties.slice(0, 3).map((specialty) => (
                        <Badge 
                          key={specialty} 
                          variant="secondary" 
                          className="text-xs bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          {specialty}
                        </Badge>
                      ))}
                      {consultant.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{consultant.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Languages</h4>
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Languages className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-center">{consultant.languages.join(', ')}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-3">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg">
                        <Star className="h-4 w-4 mr-1 fill-current text-yellow-500" />
                        <span className="font-semibold">{consultant.rating}</span>
                        <span className="text-yellow-600 ml-1 text-sm">({consultant.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{consultant.priceRange}</div>
                      <div className="text-xs text-gray-500">Price Range</div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    onClick={() => {
                      setSelectedConsultant(consultant)
                      setIsModalOpen(true)
                    }}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredConsultants.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Filter className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No consultants found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Consultant Profile Modal */}
      {isModalOpen && selectedConsultant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-screen overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Consultant Profile</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 pt-0">
              {/* Consultant Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                <div className="relative">
                  <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                    {selectedConsultant.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {selectedConsultant.availability === "Available today" && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Available
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{selectedConsultant.name}</h4>
                  <p className="text-blue-600 font-medium mb-2">RCIC License #{selectedConsultant.rcicNumber}</p>
                  <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-center sm:text-left">{selectedConsultant.location} • {selectedConsultant.timezone}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center bg-yellow-50 text-yellow-700 text-sm font-medium px-3 py-1 rounded">
                      <Star className="h-4 w-4 mr-1 fill-current text-yellow-500" />
                      <span>{selectedConsultant.rating}</span>
                      <span className="text-yellow-600 ml-1">({selectedConsultant.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{selectedConsultant.priceRange}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description/Bio */}
              <div className="mb-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Description / Bio</h5>
                <p className="text-gray-700 leading-relaxed">{selectedConsultant.bio}</p>
              </div>

              {/* Services Offered + Pricing Table */}
              <div className="mb-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Services Offered + Pricing</h5>
                <div className="grid gap-4">
                  {selectedConsultant.services.map((service, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <h6 className="font-semibold text-gray-900 mb-1">{service.name}</h6>
                          <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{service.duration}</span>
                          </div>
                        </div>
                        <div className="text-center sm:text-right sm:ml-4">
                          <div className="text-xl font-bold text-green-600 mb-2">{service.price}</div>
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                            onClick={() => {
                              navigate(`/book?rcic=${selectedConsultant.id}&service=${index + 1}`)
                            }}
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Booking Times (Calendly Embed) */}
              <div className="mb-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Available Booking Times</h5>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="mb-4">
                    <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h6 className="font-medium text-gray-700 mb-2">Calendly Integration</h6>
                    <p className="text-sm text-gray-500 mb-4">Interactive calendar will appear here</p>
                    <p className="text-xs text-gray-400">Calendly URL: {selectedConsultant.calendlyUrl}</p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Open Booking Calendar
                  </Button>
                </div>
              </div>

              {/* Reviews */}
              <div className="mb-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h5>
                <div className="space-y-4">
                  {selectedConsultant.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center mb-2">
                            <div className="font-medium text-gray-900 mr-3">{review.clientName}</div>
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
                    </div>
                  ))}
                  {selectedConsultant.reviews.length > 3 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm">
                        View All {selectedConsultant.reviewCount} Reviews
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Book Now CTA */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex space-x-4">
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg py-3"
                    onClick={() => {
                      navigate(`/book?rcic=${selectedConsultant.id}`)
                    }}
                  >
                    Book Consultation
                  </Button>
                  <Button variant="outline" className="flex-1 py-3">
                    Send Message
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
