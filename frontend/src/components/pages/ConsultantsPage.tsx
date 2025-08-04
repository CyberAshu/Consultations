import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Button } from '../shared/Button'
import { Badge } from '../ui/Badge'
import { consultantService, Consultant } from '../../services'
import ConsultantCardSkeleton from '../ui/ConsultantCardSkeleton'
import {
  Star,
  MapPin,
  DollarSign,
  Filter,
  X,
  User,
  MessageCircle,
} from 'lucide-react'

export function ConsultantsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeModalTab, setActiveModalTab] = useState<'bio' | 'reviews'>('bio')
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all consultants once to populate filter options
  const [allConsultants, setAllConsultants] = useState<Consultant[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  // Load consultants from API with debouncing
  useEffect(() => {
    const loadConsultants = async () => {
      try {
        setLoading(true)
        
        // For initial load, get all consultants for filter options
        if (isInitialLoad) {
          const allLoadedConsultants = await consultantService.getConsultants({})
          setAllConsultants(allLoadedConsultants)
          setConsultants(allLoadedConsultants)
          setIsInitialLoad(false)
        } else {
          // For subsequent loads, apply filters
          const filters = {
            search: searchTerm || undefined,
            language: selectedLanguage || undefined,
            province: selectedProvince || undefined,
            specialty: selectedSpecialty || undefined,
          }
          
          const loadedConsultants = await consultantService.getConsultants(filters)
          setConsultants(loadedConsultants)
        }
        
        setError(null)
      } catch (err) {
        console.error('Failed to load consultants:', err)
        setError('Failed to load consultants. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    // Debounce the API call to prevent multiple rapid calls
    const timeoutId = setTimeout(() => {
      loadConsultants()
    }, isInitialLoad ? 0 : 300) // No delay for initial load, 300ms for subsequent

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedLanguage, selectedProvince, selectedSpecialty, isInitialLoad])
  
  // Get unique values for filters from all consultants (not just filtered ones)
  const uniqueLanguages = Array.from(new Set(allConsultants.flatMap(c => c.languages || []))).sort()
  const uniqueProvinces = Array.from(new Set(allConsultants.map(c => c.location?.split(", ")[1]).filter(Boolean))).sort()
  const uniqueSpecialties = Array.from(new Set(allConsultants.flatMap(c => c.specialties || []))).sort()

  // Filter consultants (filtering is now done server-side via API)
  const filteredConsultants = consultants

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-white">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="https://cdn.pixabay.com/video/2021/09/05/87593-602317653_large.mp4"
          >
            <source 
              src="https://cdn.pixabay.com/video/2021/09/05/87593-602317653_large.mp4" 
              type="video/mp4" 
            />
            Your browser does not support the video tag.
          </video>
          
          {/* Professional Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>
          
          {/* Subtle Gradient Overlay for Better Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
        </div>
        
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6 leading-tight drop-shadow-lg">
              Find Your 
              <span className="block font-semibold text-blue-400">Immigration Expert</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Browse licensed RCICs and book consultations with Canada's top immigration consultants.
            </p>
          </div>
        </div>
      </section>

      {/* Consultants Grid */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto mb-16">
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by name, specialty, or language..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* Filters */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Language Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Language</label>
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">All Languages</option>
                  {uniqueLanguages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Province Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Province</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">All Provinces</option>
                  {uniqueProvinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              {/* Specialty Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Specialty</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">All Specialties</option>
                  {uniqueSpecialties.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-sm text-gray-800 font-light mb-2 uppercase tracking-wide">CONSULTANTS</h2>
              <h3 className="text-3xl md:text-4xl font-light text-gray-900">
                {filteredConsultants.length > 0 
                  ? `${filteredConsultants.length} Expert${filteredConsultants.length !== 1 ? 's' : ''} Available` 
                  : 'No consultants found'}
              </h3>
            </div>
            {(searchTerm || selectedLanguage || selectedProvince || selectedSpecialty) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedLanguage("")
                  setSelectedProvince("")
                  setSelectedSpecialty("")
                }}
                className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium rounded-full px-6 py-2 transition-all duration-300"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="text-red-500 mb-4">
                <Filter className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Consultants</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <ConsultantCardSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Consultants Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredConsultants.map((consultant) => (
                <Card 
                  key={consultant.id} 
                  className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer overflow-hidden rounded-2xl max-w-sm mx-auto"
                >
                  {/* Profile Photo Section */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {consultant.profile_image_url ? (
                      <img 
                        src={consultant.profile_image_url} 
                        alt={consultant.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <div className="text-white text-4xl font-bold">
                          {consultant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-6">
                    {/* Name & Title */}
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {consultant.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Licensed Immigration Consultant
                      </p>
                      <p className="text-xs text-gray-500">
                        RCIC #{consultant.rcic_number || 'N/A'}
                      </p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{consultant.rating ? consultant.rating.toFixed(1) : 'N/A'}</div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{consultant.experience_years ? `${consultant.experience_years}+ years` : (consultant.experience || 'N/A')}</div>
                        <div className="text-xs text-gray-500">Experience</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-emerald-600">{consultant.review_count || consultant.total_reviews || '0'}</div>
                        <div className="text-xs text-gray-500">Reviews</div>
                      </div>
                    </div>

                    {/* Location */}
                    {consultant.location && (
                      <div className="flex items-center justify-center gap-1 mb-4 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{consultant.location}</span>
                      </div>
                    )}

                    {/* Specialties Tags */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {consultant.specialties?.slice(0, 2).map((specialty, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {consultant.specialties && consultant.specialties.length > 2 && (
                        <Badge variant="secondary" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                          +{consultant.specialties.length - 2} more
                        </Badge>
                      )}
                    </div>
                    
                    {/* View Profile Button */}
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors duration-200"
                      onClick={() => {
                        setSelectedConsultant(consultant)
                        setIsModalOpen(true)
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

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
              <h3 className="text-lg sm:text-xl font-light text-gray-900">Consultant Profile</h3>
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
                  {selectedConsultant.profile_image_url ? (
                    <img 
                      src={selectedConsultant.profile_image_url} 
                      alt={selectedConsultant.name}
                      className="w-20 sm:w-24 h-20 sm:h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                      {selectedConsultant.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  {selectedConsultant.availability_status === "available" && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Available
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-xl sm:text-2xl font-light text-gray-900 mb-1">{selectedConsultant.name}</h4>
                  <p className="text-blue-600 font-medium mb-2">RCIC License #{selectedConsultant.rcic_number || 'N/A'}</p>
                  {selectedConsultant.location && (
                    <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-center sm:text-left">{selectedConsultant.location} {selectedConsultant.timezone && `• ${selectedConsultant.timezone}`}</span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    {selectedConsultant.rating && (
                      <div className="flex items-center bg-yellow-50 text-yellow-700 text-sm font-medium px-3 py-1 rounded">
                        <Star className="h-4 w-4 mr-1 fill-current text-yellow-500" />
                        <span>{selectedConsultant.rating.toFixed(1)}</span>
                        <span className="text-yellow-600 ml-1">({selectedConsultant.review_count || selectedConsultant.total_reviews || 0} reviews)</span>
                      </div>
                    )}
                    {selectedConsultant.hourly_rate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>${selectedConsultant.hourly_rate}/hour</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'bio', label: 'Description / Bio', icon: User },
                    { id: 'reviews', label: 'Reviews', icon: MessageCircle }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveModalTab(tab.id as any)}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                        activeModalTab === tab.id
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
              <div className="mb-6">
                {activeModalTab === 'bio' && (
                  <div>
                    <p className="text-gray-700 leading-relaxed text-base">{selectedConsultant.bio}</p>
                    
                    {/* Additional Info */}
                    <div className="mt-6 grid sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-500 mb-1">Experience</div>
                        <div className="text-lg font-semibold text-gray-900">{selectedConsultant.experience_years ? `${selectedConsultant.experience_years}+ years` : (selectedConsultant.experience || 'N/A')}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-500 mb-1">Total Reviews</div>
                        <div className="text-lg font-semibold text-green-600">{selectedConsultant.review_count || selectedConsultant.total_reviews || '0'}</div>
                      </div>
                    </div>
                    
                    {/* Languages & Specialties */}
                    <div className="mt-6">
                      {selectedConsultant.languages && selectedConsultant.languages.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-sm font-semibold text-gray-700 mb-2">Languages</h6>
                          <div className="flex flex-wrap gap-2">
                            {selectedConsultant.languages.map((language) => (
                              <Badge key={language} variant="secondary" className="text-sm bg-blue-50 text-blue-700 border border-blue-200">
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedConsultant.specialties && selectedConsultant.specialties.length > 0 && (
                        <div>
                          <h6 className="text-sm font-semibold text-gray-700 mb-2">Specialties</h6>
                          <div className="flex flex-wrap gap-2">
                            {selectedConsultant.specialties.map((specialty) => (
                              <Badge key={specialty} variant="secondary" className="text-sm bg-purple-50 text-purple-700 border border-purple-200">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeModalTab === 'reviews' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-light text-gray-900">Client Reviews</h3>
                      <div className="text-sm text-gray-500">
                        {selectedConsultant.review_count || selectedConsultant.total_reviews || 0} total reviews
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Display actual reviews if available */}
                      {false ? null : (
                        <div className="text-center py-8">
                          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No reviews available yet</p>
                          <p className="text-sm text-gray-400 mt-2">
                            This consultant has {selectedConsultant.review_count || selectedConsultant.total_reviews || 0} reviews with an average rating of {selectedConsultant.rating ? selectedConsultant.rating.toFixed(1) : 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
