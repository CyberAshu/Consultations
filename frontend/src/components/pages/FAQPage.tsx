import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/Card'
import { ChevronDown, HelpCircle, Search, Filter } from 'lucide-react'
import { featuresService, FAQ } from '../../services'

export function FAQPage() {
  const [openFaq, setOpenFaq] = useState<string | number | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadAllFAQs = async () => {
      try {
        const allFaqs = await featuresService.getFAQs();
        setFaqs(allFaqs);
      } catch (error) {
        console.error('Failed to load FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllFAQs();
  }, []);

  // Group FAQs by category
  const groupedFaqs = React.useMemo(() => {
    const grouped: { [key: string]: FAQ[] } = {}
    faqs.forEach(faq => {
      const category = faq.category || 'General'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(faq)
    })
    return grouped
  }, [faqs])

  // Get categories for tabs
  const categories = React.useMemo(() => {
    const cats = Object.keys(groupedFaqs)
    return ['all', ...cats]
  }, [groupedFaqs])

  // Filter FAQs based on active category and search query
  const filteredFaqs = React.useMemo(() => {
    let filtered = faqs
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === activeCategory)
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [faqs, activeCategory, searchQuery])

  const getCategoryDisplayName = (category: string) => {
    if (category === 'all') return 'All Questions'
    return category
  }

  const getCategoryCount = (category: string) => {
    if (category === 'all') return faqs.length
    return groupedFaqs[category]?.length || 0
  }

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
              Frequently 
              <span className="block font-semibold text-blue-400">Asked Questions</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Helping you feel confident, secure, and informed.
            </p>
            <p className="text-lg text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md">
              We know that navigating the immigration process can be overwhelming especially when you're
              booking a consultation that could affect your future. This FAQ is designed to ease your
              concerns, answer common questions, and guide you through how the platform works so you
              can move forward with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              // Loading skeleton
              <div className="space-y-8">
                <div className="flex flex-wrap gap-4 mb-8">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded-full w-32 animate-pulse"></div>
                  ))}
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, faqIndex) => (
                    <div key={faqIndex} className="border border-gray-200 rounded-xl p-6 bg-white animate-pulse">
                      <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Search and Filter Section */}
                <div className="mb-12">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Search for questions..."
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    {/* Category Tabs */}
                    <div className="border-b border-gray-100 -mx-6 md:-mx-8 px-6 md:px-8">
                      <div className="flex flex-wrap gap-2 md:gap-4 pb-4">
                        {categories.map((category) => {
                          const isActive = activeCategory === category
                          const count = getCategoryCount(category)
                          
                          return (
                            <button
                              key={category}
                              onClick={() => setActiveCategory(category)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                isActive
                                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <span>{getCategoryDisplayName(category)}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                isActive
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-500'
                              }`}>
                                {count}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                  {filteredFaqs.length === 0 ? (
                    <div className="text-center py-16">
                      <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
                      <p className="text-gray-500">
                        {searchQuery 
                          ? `No questions match "${searchQuery}"` 
                          : 'No questions in this category'}
                      </p>
                    </div>
                  ) : (
                    filteredFaqs.map((faq) => (
                      <Card
                        key={faq.id}
                        className={`border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden bg-white ${
                          openFaq === faq.id 
                            ? 'ring-2 ring-blue-500 shadow-xl' 
                            : 'hover:shadow-lg'
                        }`}
                      >
                        <CardContent className="p-0">
                          <button
                            className={`w-full p-6 md:p-8 text-left flex items-start justify-between transition-all duration-300 group ${
                              openFaq === faq.id 
                                ? 'bg-gradient-to-r from-blue-50 via-blue-50 to-transparent border-b border-blue-100' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  openFaq === faq.id
                                    ? 'bg-blue-200 text-blue-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {faq.category}
                                </span>
                              </div>
                              <h3 className={`font-semibold text-lg md:text-xl pr-4 transition-colors duration-300 leading-relaxed ${
                                openFaq === faq.id 
                                  ? 'text-blue-700' 
                                  : 'text-gray-900 group-hover:text-blue-600'
                              }`}>
                                {faq.question}
                              </h3>
                            </div>
                            <div className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 ml-4 ${
                              openFaq === faq.id 
                                ? 'bg-blue-200 text-blue-700' 
                                : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                            }`}>
                              <ChevronDown
                                className={`h-5 w-5 transition-all duration-300 ${
                                  openFaq === faq.id ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </button>
                          {openFaq === faq.id && (
                            <div className="px-6 md:px-8 pb-6 md:pb-8 bg-gradient-to-b from-blue-50/50 to-white border-t border-blue-100/50">
                              <div className="pt-6">
                                <div className="prose prose-gray max-w-none">
                                  <p className="text-gray-700 leading-relaxed text-base md:text-lg mb-0">
                                    {faq.answer}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
                
                {/* Show results count */}
                {filteredFaqs.length > 0 && (
                  <div className="text-center mt-12 pt-8 border-t border-gray-200">
                    <p className="text-gray-500 text-sm">
                      Showing {filteredFaqs.length} of {faqs.length} questions
                      {searchQuery && ` for "${searchQuery}"`}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">STILL HAVE QUESTIONS?</h2>
              <h3 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-8 leading-tight">
                Our support team is <em className="font-light italic text-blue-600">here to help</em>
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed font-light">
                We're here to help before, during, and after your session.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">📧 Email Support</h4>
                  <p className="text-gray-600 mb-4 font-light">Get detailed answers to your questions</p>
                  <a
                    href="mailto:support@immigwise.com"
                    className="inline-block bg-black text-white font-medium py-3 px-8 rounded-full hover:bg-gray-800 transition-all duration-300"
                  >
                    support@immigwise.com
                  </a>
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">💬 Live Chat</h4>
                  <p className="text-gray-600 mb-4 font-light">Monday to Friday, 9am–6pm (EST)</p>
                  <div className="text-sm text-gray-500 font-medium">
                    Available on our platform
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                <p className="text-gray-600 font-light">
                  🔍 Visit our Help Center for tutorials and more information
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Let's make immigration guidance accessible, secure, and human together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
