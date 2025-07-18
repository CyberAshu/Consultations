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
    <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] min-h-screen">
      {/* Header */}
      <section className="pt-28 pb-24 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-16 right-16 w-[300px] h-[300px] bg-blue-50/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 left-16 w-[350px] h-[350px] bg-indigo-50/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block mb-8 relative">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black leading-tight tracking-tight">
              <span className="text-blue-600">
                Frequently
              </span>
              <br />
              <span className="text-gray-200">
                Asked{" "}
                <span className="text-blue-600 italic font-light">
                  Questions
                </span>
              </span>
            </h1>
            <div className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-blue-600 rounded-full"></div>
          </div>
          <p className="text-lg text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about our platform and services
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-24 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-24 left-24 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-24 right-24 w-[350px] h-[350px] bg-cyan-400/10 rounded-full blur-2xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="text-2xl font-bold text-gray-200 mb-6 flex items-center gap-3">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                  {category.category}
                </h2>

                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex
                    return (
                      <Card
                        key={faqIndex}
                        className={`border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-lg overflow-hidden ${
                          openFaq === globalIndex 
                            ? 'border-blue-500 bg-white shadow-2xl ring-2 ring-blue-200 ring-opacity-50' 
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
      <section className="py-24 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-16 left-16 w-[350px] h-[350px] bg-blue-500/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 right-16 w-[300px] h-[300px] bg-cyan-400/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-8 leading-tight">
                Still have{" "}
                <span className="text-blue-600">
                  Questions?
                </span>
              </h2>
              <p className="text-lg text-blue-100 mb-6 max-w-3xl mx-auto leading-relaxed">
                Our support team is here to help. Contact us and we'll get back to you within 24 hours.
              </p>
            </div>
            
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
                  <p className="text-gray-600 mb-4">Get detailed answers to your questions</p>
                  <a
                    href="mailto:support@immigrationconnect.ca"
                    className="inline-block bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white font-bold py-3 px-8 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Email Us
                  </a>
                </div>
                <div className="hidden sm:block w-px h-20 bg-gray-200"></div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
                  <p className="text-gray-600 mb-4">Quick answers during business hours</p>
                  <button
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
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
