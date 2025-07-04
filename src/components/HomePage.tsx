import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./Button"
import { Card, CardContent } from "./ui/Card"
import { Badge } from "./ui/Badge"
import { Input } from "./ui/Input"
import { WaitingListModal } from "./WaitingListModal"
import {
  ArrowRight,
  Search,
  Calendar,
  Star,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Shield,
  Users,
  Award,
  Clock,
  Heart,
  Video,
  Target,
  Mail,
  UserCheck,
  Sparkles,
  Rocket,
  Crown,
  Gem,
  FileText,
  FileEdit,
  RefreshCw,
  Zap
} from "lucide-react"

const DisclaimerModal = ({ onAccept }: { onAccept: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Important Disclaimer</h2>
        
        <div className="space-y-4 text-gray-700">
          <p>
            The information provided on this website is for general informational purposes only and does not constitute legal advice.
          </p>
          <p>
            Immigration laws and policies change frequently. While we strive to keep the information up to date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.
          </p>
          <p>
            Any reliance you place on such information is therefore strictly at your own risk. For personalized immigration advice, please consult with a licensed immigration consultant or lawyer.
          </p>
          <p className="font-medium">
            By clicking "I Understand and Accept", you acknowledge that you have read and understood this disclaimer.
          </p>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={onAccept}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            I Understand and Accept
          </Button>
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState("")
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Check if disclaimer was already accepted
    const disclaimerAccepted = localStorage.getItem('disclaimerAccepted')
    if (!disclaimerAccepted) {
      setShowDisclaimer(true)
    }
  }, [])

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('disclaimerAccepted', 'true')
    setShowDisclaimer(false)
  }

  const testimonials = [
    {
      quote: "My study permit strategy was clarified in 30 minutes! The consultant was incredibly knowledgeable and patient with all my questions.",
      author: "Deepika K.",
      role: "International Student from India",
      rating: 5,
      flag: "🇮🇳",
      outcome: "Study Permit Approved",
    },
    {
      quote: "File review helped avoid rejection. I highly recommend their thorough document analysis service. Saved me months of delays.",
      author: "Carlos R.",
      role: "Express Entry Applicant from Mexico",
      rating: 5,
      flag: "🇲🇽",
      outcome: "PR Application Successful",
    },
    {
      quote: "Finally found honest advice without expensive retainers. Transparent pricing and excellent service throughout the process.",
      author: "Sarah M.",
      role: "Family Sponsorship from UK",
      rating: 5,
      flag: "🇬🇧",
      outcome: "Spouse Visa Approved",
    },
    {
      quote: "The RCIC helped me understand complex PNP requirements. Worth every penny for the peace of mind and expert guidance.",
      author: "Ahmed T.",
      role: "Provincial Nominee from UAE",
      rating: 5,
      flag: "🇦🇪",
      outcome: "PNP Nomination Received",
    },
  ]

  const consultants = [
    {
      name: "Dr. Sarah Chen",
      rcicNumber: "R123456",
      languages: ["English", "Mandarin", "Cantonese"],
      specialties: ["Express Entry", "Study Permits", "Work Permits"],
      rating: 4.9,
      reviews: 127,
      experience: "8+ years",
      location: "Toronto, ON",
      availability: "Available Today",
      price: "From $60 CAD",
      badge: "Top Rated",
      successRate: "96%",
    },
    {
      name: "Ahmed Hassan",
      rcicNumber: "R234567",
      languages: ["English", "Arabic", "French"],
      specialties: ["Family Sponsorship", "Refugee Claims", "Appeals"],
      rating: 4.8,
      reviews: 89,
      experience: "12+ years",
      location: "Vancouver, BC",
      availability: "Available Tomorrow",
      price: "From $60 CAD",
      badge: "Expert",
      successRate: "94%",
    },
    {
      name: "Maria Rodriguez",
      rcicNumber: "R345678",
      languages: ["English", "Spanish"],
      specialties: ["Provincial Nominee", "Work Permits", "PR Applications"],
      rating: 5.0,
      reviews: 156,
      experience: "10+ years",
      location: "Calgary, AB",
      availability: "Available in 2 days",
      price: "From $60 CAD",
      badge: "Premium",
      successRate: "98%",
    },
    {
      name: "Jean-Pierre Dubois",
      rcicNumber: "R456789",
      languages: ["English", "French"],
      specialties: ["Quebec Immigration", "Francophone Programs", "Business Immigration"],
      rating: 4.7,
      reviews: 94,
      experience: "15+ years",
      location: "Montreal, QC",
      availability: "Available Today",
      price: "From $60 CAD",
      badge: "Specialist",
      successRate: "92%",
    },
  ]

  const faqs = [
    {
      question: "Who are your consultants?",
      answer: "All our consultants are licensed RCICs (Regulated Canadian Immigration Consultants) verified by the College of Immigration and Citizenship Consultants (CICC). Each consultant displays their license number and has been vetted for experience and professionalism.",
    },
    {
      question: "How do I cancel or reschedule?",
      answer: "You can cancel or reschedule up to 24 hours before your appointment through your booking confirmation email or by contacting support. Cancellations made less than 24 hours in advance may be subject to a fee.",
    },
    {
      question: "Do I need to upload anything?",
      answer: "For simple consultations, no uploads are required. For file reviews, you'll upload documents after booking to ensure your consultant is prepared. We'll provide a secure upload link and checklist.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. All payments are processed securely through our encrypted payment system.",
    },
    {
      question: "Is my information secure?",
      answer: "Absolutely. We use bank-level encryption for all data transmission and storage. Your personal information and documents are protected according to Canadian privacy laws.",
    },
  ]

  const services = [
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: "General Consultations",
      description: "Time-based immigration consultations",
      features: [
        "30/45/60 min pay-per-session model",
        "IRCC programs & eligibility",
        "Portal navigation & documentation",
        "Options assessment"
      ],
      color: "from-blue-600 to-blue-700"
    },
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      title: "Document Review",
      description: "Professional review of your immigration documents",
      features: [
        "IRCC forms review",
        "SOP & LOE evaluation",
        "Refusal analysis",
        "Live feedback discussion"
      ],
      color: "from-blue-600 to-blue-700"
    },
    {
      icon: <FileEdit className="h-6 w-6 text-blue-600" />,
      title: "Form Filling Assistance",
      description: "Step-by-step form guidance",
      features: [
        "IMM forms & GCKey help",
        "PR & Sponsorship forms",
        "TRV & LMIA guidance",
        "Non-submission support"
      ],
      color: "from-blue-600 to-blue-700"
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-blue-600" />,
      title: "Follow-up Services",
      description: "Ongoing support and extensions",
      features: [
        "+15 min session extensions",
        "Follow-up bookings",
        "IRCC response planning",
        "Procedural fairness help"
      ],
      color: "from-blue-600 to-blue-700"
    },
    {
      icon: <Target className="h-6 w-6 text-blue-600" />,
      title: "Program-Specific Help",
      description: "Specialized immigration programs",
      features: [
        "Express Entry & PNP",
        "Study/Work Permits",
        "Family Sponsorship",
        "Visitor & Super Visas"
      ],
      color: "from-blue-600 to-blue-700"
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Multi-Session Packages",
      description: "Comprehensive support plans",
      features: [
        "3-session bundle available",
        "PR Planning Kit",
        "Student-to-PR Track",
        "Custom packages"
      ],
      color: "from-blue-600 to-blue-700"
    }
  ]

  return (
    <div className="min-h-screen overflow-x-hidden">
      {showDisclaimer && <DisclaimerModal onAccept={handleAcceptDisclaimer} />}
      {/* Waitlist Modal */}
      <WaitingListModal 
        isOpen={isWaitlistOpen} 
        onClose={() => setIsWaitlistOpen(false)} 
      />
      
      {/* Professional Hero Section with Background Video */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="https://cdn.pixabay.com/video/2021/09/05/87593-602317653_large.mp4"
          >
            {/* Working professional video sources */}
            <source 
              src="https://cdn.pixabay.com/video/2021/09/05/87593-602317653_large.mp4" 
              type="video/mp4" 
            />
            <source 
              src="https://cdn.pixabay.com/video/2021/09/05/87593-602317653_large.mp4" 
              type="video/mp4" 
            />
            <source 
              src="https://cdn.pixabay.com/video/2021/09/05/87593-602317653_large.mp4" 
              type="video/mp4" 
            />
            {/* Fallback video from Internet Archive */}
            <source 
              src="https://cdn.pixabay.com/video/2021/09/05/87593-602317653_large.mp4" 
              type="video/mp4" 
            />
            {/* Fallback - this will show if video fails */}
            Your browser does not support the video tag.
          </video>
          
          {/* Professional Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>
          
          {/* Subtle Gradient Overlay for Better Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
        </div>

        {/* Content Layer */}
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Clean Typography with Better Contrast */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 leading-tight drop-shadow-lg">
              Navigate to
              <span className="block font-semibold text-blue-400">Canada</span>
            </h1>
            
            {/* Minimal Subtitle */}
            <p className="text-xl md:text-2xl text-gray-100 mb-8 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Connect with licensed immigration consultants. 
              <span className="text-white font-medium">Professional guidance, simplified.</span>
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 mb-12 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <span className="text-white">Licensed RCICs</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-white">Transparent Pricing</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Zap className="h-4 w-4 text-blue-400" />
                <span className="text-white">Instant Booking</span>
              </div>
            </div>
            
            {/* Clean CTA */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 hover:border-white/50"
                onClick={() => setIsWaitlistOpen(true)}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
        
        {/* Subtle Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 z-10"></div>
      </section>

      {/* Professional Services Overview Section */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-8 relative">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black leading-tight tracking-tight">
                <span className="text-blue-600 text-4xl lg:text-5xl xl:text-6xl">
                  What we offer
                </span>
              </h2>
              <div className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-blue-600 rounded-full"></div>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive immigration solutions from licensed experts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {services.map((service, index) => (
              <Card
                key={index}
                className="border-0 shadow-xl hover:shadow-2xl bg-white hover:bg-white relative overflow-hidden"
              >
                <CardContent className="p-8 relative overflow-hidden">
                  {/* Background Animation */}
                  <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 rounded-2xl"></div>

                  {/* Professional Icon */}
                  <div
                    className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 shadow-lg relative z-10"
                  >
                    {service.icon}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">
                    {service.title}
                  </h3>

                  <p className="text-gray-600 mb-4 relative z-10 leading-relaxed">{service.description}</p>

                  <ul className="space-y-2 mb-6 relative z-10">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-gray-600 text-sm">
                        <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 rounded-md mt-4">
                    Book Service
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trusted by Thousands of Clients</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Join thousands of successful applicants who trusted our licensed consultants</p>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-4"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-5xl mx-auto">
            <div className="p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Licensed RCICs</h3>
              <p className="text-sm text-gray-600 mt-1">Verified & Regulated</p>
            </div>
            
            <div className="p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">98% Success Rate</h3>
              <p className="text-sm text-gray-600 mt-1">Proven Track Record</p>
            </div>
            
            <div className="p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">24/7 Support</h3>
              <p className="text-sm text-gray-600 mt-1">Always Here to Help</p>
            </div>
            
            <div className="p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">10+ Years</h3>
              <p className="text-sm text-gray-600 mt-1">Industry Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional How It Works Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-8 relative">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black leading-tight tracking-tight">
                <span className="text-blue-600">
                  How It
                </span>{" "}
                <span className="text-gray-900 italic font-light relative">
                  Works
                  <div className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-blue-600 rounded-full"></div>
                </span>
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Three simple steps to connect with licensed immigration experts
            </p>
          </div>

          <div className="relative pt-16 pb-24">
            <div className="hidden md:flex absolute top-1/2 left-0 right-0 -translate-y-1/2 items-center justify-center px-4 pointer-events-none z-10">
              {/* First arrow - between card 1 and 2 */}
              <div className="absolute left-1/3 transform -translate-x-1/2">
                <div className="bg-white p-2 rounded-full shadow-lg">
                  <ArrowRight className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              {/* Second arrow - between card 2 and 3 */}
              <div className="absolute left-2/3 transform -translate-x-1/2">
                <div className="bg-white p-2 rounded-full shadow-lg">
                  <ArrowRight className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Search className="h-8 w-8" />,
                  step: "1",
                  title: "Browse & Choose",
                  description: "Browse licensed consultants by your immigration need, expertise, and language preference",
                  color: "bg-blue-600",
                  bgColor: "bg-blue-50",
                  shadowColor: "shadow-blue-500/20",
                  delay: "0ms",
                },
                {
                  icon: <Calendar className="h-8 w-8" />,
                  step: "2",
                  title: "Book & Pay",
                  description: "Select your preferred time slot, pay securely, and upload documents if needed",
                  color: "bg-blue-600",
                  bgColor: "bg-blue-50",
                  shadowColor: "shadow-indigo-500/20",
                  delay: "200ms",
                },
                {
                  icon: <Video className="h-8 w-8" />,
                  step: "3",
                  title: "Meet & Get Expert Help",
                  description: "Connect via secure video call and receive personalized immigration guidance",
                  color: "bg-blue-600",
                  bgColor: "bg-blue-50",
                  shadowColor: "shadow-purple-500/20",
                  delay: "400ms",
                },
              ].map((step, index) => (
                <div key={index} className="relative">
                  <Card
                    className="border-0 shadow-xl hover:shadow-2xl bg-white/95 hover:bg-white relative overflow-hidden h-full"
                  >
                    <CardContent className="p-6 md:p-8 text-center relative overflow-hidden h-full flex flex-col">
                      {/* Background Animation */}
                      <div
                        className={`absolute inset-0 ${step.bgColor} opacity-0 group-hover:opacity-100 rounded-2xl`}
                      ></div>

                      {/* Professional Icon with Step Number */}
                      <div className="relative w-20 h-20 mx-auto mb-6">
                        <div 
                          className={`w-full h-full ${step.color} rounded-2xl relative z-10 flex items-center justify-center text-white`}
                        >
                          <div className="text-3xl">
                            {step.icon}
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-gray-200 text-gray-800 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                            {step.step}
                          </div>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-4 relative z-10 group-hover:text-gray-800">
                        {step.title}
                      </h3>

                      <p className="text-gray-600 leading-relaxed relative z-10 group-hover:text-gray-700 flex-grow">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Professional RCIC Preview Section */}
      <section
        id="consultants"
        className="py-24 bg-gray-50 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-8 relative">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black leading-tight tracking-tight">
                <span className="text-blue-600">
                  Meet Our
                </span>
                <br />
                <span className="text-gray-900">
                  Licensed{" "}
                  <span className="text-blue-600 italic font-light">
                    RCICs
                  </span>
                </span>
              </h2>
              <div className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-blue-600 rounded-full"></div>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Licensed professionals ready to help with your immigration journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {consultants.map((consultant, index) => (
              <Card
                key={index}
                className="border border-gray-100 shadow-sm hover:shadow"
              >
                <CardContent className="p-6 text-center">
                  {/* Professional Profile Image */}
                  <div className="relative w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg font-bold">
                        {consultant.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {consultant.name}
                  </h3>
                  <p className="text-blue-600 text-xs mb-2">RCIC #{consultant.rcicNumber}</p>
                  
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(consultant.rating)
                            ? "text-blue-600 fill-current"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-gray-500 text-xs">
                      ({consultant.reviews})
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-1.5">
                    {[...consultant.languages.slice(0, 2), ...consultant.specialties.slice(0, 2)].map((item, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-[10px] py-0.5 px-2 h-5 border-gray-200 text-gray-600"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl"
              onClick={() => navigate('/consultants')}
            >
              <span className="flex items-center gap-3">
                See All Consultants
                <ChevronRight className="h-5 w-5" />
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Success Stories
            </h2>
            <p className="text-blue-600 text-lg">
              from Real Clients
            </p>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-4"></div>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{testimonials[currentTestimonial].flag}</span>
                  <Badge className="bg-green-50 text-green-700 border border-green-100 text-xs">
                    {testimonials[currentTestimonial].outcome}
                  </Badge>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < testimonials[currentTestimonial].rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>

                <blockquote className="text-gray-700 italic mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].quote}"
                </blockquote>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm font-bold">
                        {testimonials[currentTestimonial].author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{testimonials[currentTestimonial].author}</div>
                    <div className="text-sm text-gray-500">{testimonials[currentTestimonial].role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full ${index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Professional FAQ Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-24 right-24 w-[300px] h-[300px] bg-blue-50/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-24 left-24 w-[350px] h-[350px] bg-indigo-50/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-8 relative">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black leading-tight tracking-tight">
                <span className="text-blue-600">
                  Frequently
                </span>
                <br />
                <span className="text-gray-900">
                  Asked{" "}
                  <span className="text-blue-600 italic font-light">
                    Questions
                  </span>
                </span>
              </h2>
              <div className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-blue-600 rounded-full"></div>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Quick answers to common questions about our platform and services
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6 mb-16">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-blue-50 transition-colors duration-300 group"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-semibold text-gray-900 text-lg pr-4 group-hover:text-blue-600 transition-colors duration-300">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-500 transition-all duration-300 flex-shrink-0 group-hover:text-blue-600 ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center gap-3">
                View All FAQs
                <ChevronRight className="h-5 w-5" />
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* Professional Email Capture Section */}
      <section className="py-24 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-16 left-16 w-[350px] h-[350px] bg-blue-500/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 right-16 w-[300px] h-[300px] bg-cyan-400/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-16">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-8 leading-tight">
                Get Early Access +{" "}
                <span className="text-blue-600">
                  10% Off
                </span>
              </h2>
              <p className="text-lg text-blue-100 mb-6 max-w-3xl mx-auto leading-relaxed">
                Be first to know when we launch + receive exclusive early-bird offers
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-blue-200/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>Exclusive Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-blue-600" />
                  <span>VIP Treatment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gem className="h-4 w-4 text-blue-600" />
                  <span>Premium Benefits</span>
                </div>
              </div>
            </div>

            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm hover:shadow-3xl transition-all duration-500">
              <CardContent className="p-10">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative">
                      <Input
                        placeholder="First Name"
                        className="py-4 px-4 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors duration-300 bg-white/90"
                      />
                      <div className="absolute top-4 right-4">
                        <UserCheck className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="Email Address"
                        className="py-4 px-4 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors duration-300 bg-white/90"
                      />
                      <div className="absolute top-4 right-4">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      className="w-full py-4 px-4 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-white/90"
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                    >
                      <option value="">Select Your Immigration Goal</option>
                      <option value="express-entry">🚀 Express Entry</option>
                      <option value="study-permit">🎓 Study Permit</option>
                      <option value="work-permit">💼 Work Permit</option>
                      <option value="family-sponsorship">❤️ Family Sponsorship</option>
                      <option value="provincial-nominee">🏛️ Provincial Nominee Program</option>
                      <option value="citizenship">🍁 Canadian Citizenship</option>
                      <option value="other">🤔 Other / Not Sure</option>
                    </select>
                    <div className="absolute top-4 right-4">
                      <Target className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-xl font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <Rocket className="h-5 w-5" />
                      Join Waitlist - Get 10% Off
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-gray-500">
                    Join <span className="font-bold text-blue-600">2,500+</span> people already on the waitlist
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="flex -space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 border border-white"
                        ></div>
                      ))}
                    </div>
                    <span className="text-gray-600 ml-3 text-sm">and counting...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

