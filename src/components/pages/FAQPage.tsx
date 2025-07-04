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
    <div className="pt-20">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about our platform and services
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                  {category.category}
                </h2>

                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex
                    return (
                      <Card
                        key={faqIndex}
                        className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <CardContent className="p-0">
                          <button
                            className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => setOpenFaq(openFaq === globalIndex ? null : globalIndex)}
                          >
                            <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                            <ChevronDown
                              className={`h-5 w-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                                openFaq === globalIndex ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {openFaq === globalIndex && (
                            <div className="px-6 pb-6">
                              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
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
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Still have questions?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Our support team is here to help. Contact us and we'll get back to you within 24 hours.
          </p>
          <a
            href="mailto:support@immigrationconnect.ca"
            className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors duration-300"
          >
            Contact Support
          </a>
        </div>
      </section>
    </div>
  )
}
