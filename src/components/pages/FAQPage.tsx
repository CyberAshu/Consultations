import React, { useState } from 'react'
import { Card, CardContent } from '../ui/Card'
import { ChevronDown, HelpCircle } from 'lucide-react'

export function FAQPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "Who are your consultants?",
          answer:
            "All our consultants are licensed RCICs (Regulated Canadian Immigration Consultants) verified by the College of Immigration and Citizenship Consultants (CICC). Each consultant displays their license number and has been vetted for experience and professionalism.",
        },
        {
          question: "How do I book a consultation?",
          answer:
            "Simply browse our consultant directory, select a consultant that matches your needs, choose your preferred time slot, and complete the secure payment process. You'll receive a confirmation email with your meeting details.",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. All payments are processed securely through our encrypted payment system.",
        },
      ],
    },
    {
      category: "Consultations",
      questions: [
        {
          question: "How do I cancel or reschedule?",
          answer:
            "You can cancel or reschedule up to 24 hours before your appointment through your booking confirmation email or by contacting our support team. Cancellations made less than 24 hours in advance may be subject to a fee.",
        },
        {
          question: "Do I need to upload anything?",
          answer:
            "For simple consultations, no uploads are required. For file reviews, you'll upload documents after booking to ensure your consultant is prepared. We'll provide a secure upload link and checklist of required documents.",
        },
        {
          question: "What happens during the consultation?",
          answer:
            "You'll meet with your chosen RCIC via secure video call. They'll review your situation, answer your questions, and provide expert guidance tailored to your immigration goals. Sessions are confidential and professional.",
        },
        {
          question: "Can I get a recording of my session?",
          answer:
            "For privacy and confidentiality reasons, we don't provide session recordings. However, you can purchase a session summary email for $25 CAD that includes key points and recommendations discussed.",
        },
      ],
    },
    {
      category: "Pricing & Billing",
      questions: [
        {
          question: "Are there any hidden fees?",
          answer:
            "No hidden fees ever. Our pricing is completely transparent - you pay exactly what's listed for each service. The only additional costs are optional add-ons like session summaries or follow-up appointments.",
        },
        {
          question: "Do you offer refunds?",
          answer:
            "Refunds are available for cancellations made more than 24 hours in advance. If you're unsatisfied with your consultation, please contact our support team within 48 hours to discuss resolution options.",
        },
        {
          question: "Can I purchase multiple sessions at once?",
          answer:
            "Yes! We offer a 3-session bundle for $150 CAD (three 30-minute sessions), which provides savings compared to booking individually. Bundles must be used within 6 months of purchase.",
        },
      ],
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "What if I have technical issues during my call?",
          answer:
            "Our support team is available during all consultation hours to help with technical issues. If technical problems prevent your consultation, we'll reschedule at no additional cost.",
        },
        {
          question: "What platform do you use for video calls?",
          answer:
            "We use secure, PIPEDA-compliant video conferencing technology. You'll receive a meeting link that works in any modern web browser - no software download required.",
        },
        {
          question: "Is my information secure?",
          answer:
            "Absolutely. We use bank-level encryption for all data transmission and storage. Your personal information and documents are protected according to Canadian privacy laws and are never shared without your consent.",
        },
      ],
    },
  ]

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
              Everything you need to know about our platform and services.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-8 flex items-center gap-3" style={{fontFamily: "'Bricolage Grotesque', sans-serif"}}>
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                  {category.category}
                </h2>

                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex
                    return (
                      <Card
                        key={faqIndex}
                        className={`border shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden ${
                          openFaq === globalIndex 
                            ? 'border-blue-300 bg-white shadow-xl' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <CardContent className="p-0">
                          <button
                            className={`w-full p-6 text-left flex items-center justify-between transition-all duration-300 group rounded-t-lg ${
                              openFaq === globalIndex 
                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setOpenFaq(openFaq === globalIndex ? null : globalIndex)}
                          >
                            <span className={`font-semibold text-lg pr-4 transition-colors duration-300 ${
                              openFaq === globalIndex 
                                ? 'text-blue-700' 
                                : 'text-gray-900 group-hover:text-blue-600'
                            }`}>
                              {faq.question}
                            </span>
                            <div className={`p-2 rounded-full transition-all duration-300 ${
                              openFaq === globalIndex 
                                ? 'bg-blue-200 text-blue-700' 
                                : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                            }`}>
                              <ChevronDown
                                className={`h-5 w-5 transition-all duration-300 flex-shrink-0 ${
                                  openFaq === globalIndex ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </button>
                          {openFaq === globalIndex && (
                            <div className="px-6 pb-6 bg-gradient-to-b from-blue-50 to-white border-t border-blue-100 animate-fade-in">
                              <div className="pt-4">
                                <p className="text-gray-700 leading-relaxed text-base">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">NEED HELP?</h2>
              <h3 className="text-4xl md:text-5xl font-light text-gray-900 mb-8 leading-tight" style={{fontFamily: "'Bricolage Grotesque', sans-serif"}}>
                Still have <em className="font-light italic text-blue-600">Questions?</em>
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed font-light">
                Our support team is here to help. Contact us and we'll get back to you within 24 hours.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <div className="text-center flex-1">
                  <h4 className="text-xl font-medium text-gray-900 mb-2" style={{fontFamily: "'Bricolage Grotesque', sans-serif"}}>Email Support</h4>
                  <p className="text-gray-600 mb-4 font-light">Get detailed answers to your questions</p>
                  <a
                    href="mailto:support@immigrationconnect.ca"
                    className="inline-block bg-black text-white font-medium py-3 px-8 rounded-full hover:bg-gray-800 transition-all duration-300"
                  >
                    Email Us
                  </a>
                </div>
                <div className="hidden sm:block w-px h-20 bg-gray-200"></div>
                <div className="text-center flex-1">
                  <h4 className="text-xl font-medium text-gray-900 mb-2" style={{fontFamily: "'Bricolage Grotesque', sans-serif"}}>Live Chat</h4>
                  <p className="text-gray-600 mb-4 font-light">Quick answers during business hours</p>
                  <button
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition-all duration-300"
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
