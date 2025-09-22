import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../shared/Button"
import { WaitingListModal } from "../shared/WaitingListModal"
import { featuresService, Testimonial, FAQ } from "../../services"
import "../shared/styles/testimonial-animation.css"
import {
  Calendar,
  Star,
  ChevronDown,
  Shield,
  Heart,
  Zap
} from "lucide-react"


export function HomePage() {
  const navigate = useNavigate()
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const testimonialScrollRef = useRef<HTMLDivElement>(null)

useEffect(() => {
    // Check for password recovery tokens in URL and redirect to reset password page
    const checkForRecoveryTokens = () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      
      // Check if we have recovery tokens (access_token and type=recovery)
      const hasAccessToken = hashParams.get('access_token') || queryParams.get('access_token');
      const isRecoveryType = hashParams.get('type') === 'recovery' || queryParams.get('type') === 'recovery';
      
      if (hasAccessToken && isRecoveryType) {
        // Redirect to reset password page while preserving the tokens in the URL
        navigate('/reset-password' + window.location.hash);
        return true;
      }
      return false;
    };

    // Check for recovery tokens first
    if (checkForRecoveryTokens()) {
      return; // Don't load homepage data if redirecting
    }

    // If the user arrives from email confirmation without a redirect (type=signup), route to confirmation page
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('type') === 'signup') {
      navigate('/auth/confirm' + window.location.hash);
      return;
    }

    // Load testimonials and FAQs from API
    const loadData = async () => {
      try {
        const [loadedTestimonials, loadedFaqs] = await Promise.all([
          featuresService.getTestimonials(),
          featuresService.getHomeFAQs()
        ]);

        setTestimonials(loadedTestimonials);
        setFaqs(loadedFaqs);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Auto-scroll testimonials
    const interval = setInterval(() => {
      if (testimonialScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = testimonialScrollRef.current
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1
        testimonialScrollRef.current.scrollTo({
          left: isAtEnd ? 0 : scrollLeft + clientWidth,
          behavior: 'smooth'
        })
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])


  // const testimonials = [
  //   {
  //     quote: "My study permit strategy was clarified in 30 minutes! The consultant was incredibly knowledgeable and patient with all my questions.",
  //     author: "Deepika K.",
  //     role: "International Student from India",
  //     rating: 5,
  //     flag: "🇮🇳",
  //     outcome: "Study Permit Approved",
  //   },
  //   {
  //     quote: "File review helped avoid rejection. I highly recommend their thorough document analysis service. Saved me months of delays.",
  //     author: "Carlos R.",
  //     role: "Express Entry Applicant from Mexico",
  //     rating: 5,
  //     flag: "🇲🇽",
  //     outcome: "PR Application Successful",
  //   },
  //   {
  //     quote: "Finally found honest advice without expensive retainers. Transparent pricing and excellent service throughout the process.",
  //     author: "Sarah M.",
  //     role: "Family Sponsorship from UK",
  //     rating: 5,
  //     flag: "🇬🇧",
  //     outcome: "Spouse Visa Approved",
  //   },
  //   {
  //     quote: "The RCIC helped me understand complex PNP requirements. Worth every penny for the peace of mind and expert guidance.",
  //     author: "Ahmed T.",
  //     role: "Provincial Nominee from UAE",
  //     rating: 5,
  //     flag: "🇦🇪",
  //     outcome: "PNP Nomination Received",
  //   },
  // ]

  // const consultants = [
  //   {
  //     name: "Dr. Sarah Chen",
  //     rcicNumber: "R123456",
  //     languages: ["English", "Mandarin", "Cantonese"],
  //     specialties: ["Express Entry", "Study Permits", "Work Permits"],
  //     rating: 4.9,
  //     reviews: 127,
  //     experience: "8+ years",
  //     location: "Toronto, ON",
  //     availability: "Available Today",
  //     price: "From $60 CAD",
  //     badge: "Top Rated",
  //     successRate: "96%",
  //   },
  //   {
  //     name: "Ahmed Hassan",
  //     rcicNumber: "R234567",
  //     languages: ["English", "Arabic", "French"],
  //     specialties: ["Family Sponsorship", "Refugee Claims", "Appeals"],
  //     rating: 4.8,
  //     reviews: 89,
  //     experience: "12+ years",
  //     location: "Vancouver, BC",
  //     availability: "Available Tomorrow",
  //     price: "From $60 CAD",
  //     badge: "Expert",
  //     successRate: "94%",
  //   },
  //   {
  //     name: "Maria Rodriguez",
  //     rcicNumber: "R345678",
  //     languages: ["English", "Spanish"],
  //     specialties: ["Provincial Nominee", "Work Permits", "PR Applications"],
  //     rating: 5.0,
  //     reviews: 156,
  //     experience: "10+ years",
  //     location: "Calgary, AB",
  //     availability: "Available in 2 days",
  //     price: "From $60 CAD",
  //     badge: "Premium",
  //     successRate: "98%",
  //   },
  //   {
  //     name: "Jean-Pierre Dubois",
  //     rcicNumber: "R456789",
  //     languages: ["English", "French"],
  //     specialties: ["Quebec Immigration", "Francophone Programs", "Business Immigration"],
  //     rating: 4.7,
  //     reviews: 94,
  //     experience: "15+ years",
  //     location: "Montreal, QC",
  //     availability: "Available Today",
  //     price: "From $60 CAD",
  //     badge: "Specialist",
  //     successRate: "92%",
  //   },
  // ]


  // const services = [
  //   {
  //     icon: <Clock className="h-6 w-6 text-white" />,
  //     title: "Quick Immigration Advice Session",
  //     description: "30, 45, 60 min. Live 1-on-1 session with a licensed RCIC.",
  //     features: [
  //       "Reliable answers from a licensed RCIC.",
  //       "Clarification on documents, timelines, or eligibility.",
  //       "Trusted advice before you take your next step.",
  //       "Ideal for first-time applicants or people seeking clarity.",
  //       "No document prep required just book and talk."
  //     ],
  //     color: "from-blue-600 to-blue-700"
  //   },
  //   {
  //     icon: <FileText className="h-6 w-6 text-white" />,
  //     title: "Eligibility Check & Program Matching",
  //     description: "Personalized review of your qualifications.",
  //     features: [
  //       "A clear list of immigration options that match.",
  //       "Advice on which programs are realistic or risky.",
  //       "Consultant reviews your profile and background.",
  //       "Get matched with the most realistic Canadian immigration pathways.",
  //       "Advice on study permits, work permits, PR, Express Entry, etc."
  //     ],
  //     color: "from-blue-600 to-blue-700"
  //   },
  //   {
  //     icon: <FileEdit className="h-6 w-6 text-white" />,
  //     title: "Strategic Immigration Planning",
  //     description: "Build a long-term or multi-step immigration roadmap.",
  //     features: [
  //       "Side-by-side comparison of your possible paths.",
  //       "Compare multiple programs and options based on your goals.",
  //       "CRS improvement tips, timelines, and risk analysis.",
  //       "Ideal for people with complex profiles or multiple pathways.",
  //       "Tips for maximizing points or preparing your file."
  //     ],
  //     color: "from-blue-600 to-blue-700"
  //   },
  //   {
  //     icon: <RefreshCw className="h-6 w-6 text-white" />,
  //     title: "Final Application Review",
  //     description: "Document and form check for accuracy and completeness.",
  //     features: [
  //       "Upload your draft forms and supporting documents.",
  //       "Consultant checks for errors, missing info, or red flags.",
  //       "Receive expert feedback before you submit to IRCC.",
  //       "Increases your chances of approval without hiring a full representative.",
  //       "Suggestions to improve supporting evidence."
  //     ],
  //     color: "from-blue-600 to-blue-700"
  //   },
  //   {
  //     icon: <Target className="h-6 w-6 text-white" />,
  //     title: "Refusal Letter Evaluation",
  //     description: "Clear breakdown of the refusal letter.",
  //     features: [
  //       "The consultant reviews your IRCC refusal letter in detail.",
  //       "Understand what went wrong and what to do next.",
  //       "Learn whether to reapply, appeal, or change strategy.",
  //       "Helps avoid repeating the same mistakes.",
  //       "Expert insights into what likely went wrong."
  //     ],
  //     color: "from-blue-600 to-blue-700"
  //   },
  //   {
  //     icon: <Globe className="h-6 w-6 text-white" />,
  //     title: "International Applicant Guidance",
  //     description: "Tailored guidance for your country of residence.",
  //     features: [
  //       "Designed for clients applying from outside Canada.",
  //       "Tailored advice based on your country, visa type, and supporting documents.",
  //       "Consultant helps you prove ties to home and meet Canadian standards.",
  //       "Especially helpful for study permits, visitor visas, or first-time applicants.",
  //       "Culturally aware advice from consultants who know your region."
  //     ],
  //     color: "from-blue-600 to-blue-700"
  //   }
  // ]

  return (
    <div className="min-h-full overflow-x-hidden ">
      {/* Waitlist Modal */}
      <WaitingListModal 
        isOpen={isWaitlistOpen} 
        onClose={() => setIsWaitlistOpen(false)} 
      />
      
      {/* Professional Hero Section with Background Video */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden top-0 left-0 right-0 z-10">
        {/* Content Layer */}
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Clean Typography with Better Contrast */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6 leading-tight drop-shadow-lg">
              Simplifying
              <span className="block font-semibold text-blue-400">Immigration Consultation</span>
            </h1>
            
            {/* Minimal Subtitle */}
            <p className="text-xl md:text-2xl text-gray-100 mb-8 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Simple, affordable, on demand sessions with verified RCICs.
            </p>
            
            
            
            {/* Clean CTA */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-gray-700 hover:bg-gray-700 text-white px-8 py-4 text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
                onClick={() => setIsWaitlistOpen(true)}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book Consultation
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/videos/consultations.mp4"
          >
            <source 
              src="/videos/consultations.mp4" 
              type="video/mp4" 
            />
            <source 
              src="/videos/consultations.mp4" 
              type="video/mp4" 
            />
            <source 
              src="/videos/consultations.mp4" 
              type="video/mp4" 
            />
            <source 
              src="/videos/consultations.mp4" 
              type="video/mp4" 
            />
            <p>Your browser does not support the video tag.</p>
          </video>
          
          {/* Professional Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>
          
          {/* Subtle Gradient Overlay for Better Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
        </div>
      </section>

      {/* Modern Immigration Management Features Section - Gale Inspired */}
      <section className="max-w-[95dvw] md:max-w-[78dvw] 2.5xl:max-w-[1300px] mx-auto md:px-4 py-12 flex flex-col justify-center items-center md:items-start md:flex-row md:gap-10">
        <div className="px-[5dvw] md:px-0 transition-all duration-700 ease-out transform w-[95%] md:w-[44%]" style={{opacity: 1, transform: 'translateY(0px)'}}>
          <h2 className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">SERVICES</h2>
          <h1 className="text-4xl md:text-5xl font-light mb-4">Book with Confidence. Pay Only for What You Need</h1>
<p className="text-gray-600 font-light mb-8">ImmigWise empowers you to book trusted Canadian immigration experts on demand from anywhere in the world.</p>
          <div className="w-fit">
            <Button 
              className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-light lg:block hidden hover:cursor-pointer"
              onClick={() => navigate('/about')}
            >
              Learn More
            </Button>
          </div>
        </div>
        <div className="w-[95%] md:w-[56%] border-[1px] border-gray-300 rounded-lg p-4 shadow-md" style={{opacity: 1, transform: 'translateY(0px)'}}>
          <ul className="max-w-2xl mx-auto w-full flex flex-col gap-2">
            {[
              {
                title: "Quick Immigration Advice Session",
                description: "30, 45, 60 min. Live 1-on-1 session with a licensed RCIC.",
                icon: "📋"
              },
              {
                title: "Eligibility Check & Program Matching", 
                description: "Personalized review of your qualifications.",
                icon: "📄"
              },
              {
                title: "Strategic Immigration Planning",
                description: "Build a long-term or multi-step immigration roadmap.", 
                icon: "✍️"
              },
              {
                title: "Final Application Review",
                description: "Document and form check for accuracy and completeness.",
                icon: "🔄"
              },
              {
                title: "Refusal Letter Evaluation",
                description: "Clear breakdown of the refusal letter.",
                icon: "🎯"
              },
              {
                title: "International Applicant Guidance",
                description: "Tailored guidance for your country of residence.",
                icon: "🌍"
              }
            ].map((service, index) => {
              const serviceIds = [
                'quick-immigration-advice',
                'eligibility-check-program-matching',
                'strategic-immigration-planning',
                'final-application-review',
                'refusal-letter-evaluation',
                'international-applicant-guidance'
              ];
              
              return (
                <div key={index} className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50 rounded-xl cursor-pointer border border-gray-200 shadow-sm" style={{opacity: 1, transform: 'translateY(0px)'}}>
                  <div className="flex gap-4 flex-col md:flex-row items-center">
                    <div className="flex justify-center">
                      <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                        {service.icon}
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="font-medium text-[18px] text-neutral-800 text-center md:text-left">{service.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    </div>
                  </div>
                  <button 
                    className="px-4 py-2 text-sm rounded-[10px] font-medium bg-black hover:bg-gray-800 text-white mt-4 md:mt-0 hover:cursor-pointer w-[170px]"
                    onClick={() => navigate(`/services?service=${serviceIds[index]}`)}
                  >
                    View Details
                  </button>
                </div>
              )
            })}
          </ul>
        </div>
      </section>

{/* Why ImmigWise Section - Modern & Responsive */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-base font-semibold text-blue-600 tracking-wider uppercase">Our Advantage</h2>
            <h3 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 tracking-tight">
Why ImmigWise?
            </h3>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-500">
              We provide a streamlined, transparent, and secure platform to connect with licensed immigration experts.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600">
                <Shield size={24} />
              </div>
              <h4 className="mt-6 text-xl font-light text-gray-900">Verified Experts</h4>
              <p className="mt-2 text-base text-gray-500">
                Connect with licensed RCICs whose credentials have been rigorously verified by our team for your peace of mind.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600">
                <Heart size={24} />
              </div>
              <h4 className="mt-6 text-xl font-light text-gray-900">High-Touch Support</h4>
              <p className="mt-2 text-base text-gray-500">
                Receive prompt, dedicated support within 24 hours, ensuring you're always informed and confident.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-purple-600">
                <Zap size={24} />
              </div>
              <h4 className="mt-6 text-xl font-light text-gray-900">Seamless Experience</h4>
              <p className="mt-2 text-base text-gray-500">
                Enjoy a user-friendly platform with simple booking, clear guidance, and a secure portal for your case.
              </p>
            </div>
          </div>
          <div className="mt-16 text-center">
            <p className="text-lg text-gray-600">Have more questions?</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white font-semibold rounded-full px-8 py-3 transition-transform transform hover:scale-105"
                onClick={() => navigate('/consultants')}
              >
                Book a Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Gale Inspired */}
      <section className="max-w-[95dvw] md:max-w-[78dvw] 2.5xl:max-w-[1300px] mx-auto md:px-4 py-12 flex flex-col justify-center items-center md:items-start md:flex-row md:gap-10">
        <div className="px-[5dvw] md:px-0 transition-all duration-700 ease-out transform w-[95%] md:w-[44%]" style={{opacity: 1, transform: 'translateY(0px)'}}>
          <h2 className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">PROCESS</h2>
          <h1 className="text-4xl md:text-5xl font-light mb-4">How It Works</h1>
          <p className="text-gray-600 font-light mb-8">Three simple steps to connect with licensed immigration experts and get the professional guidance you need.</p>
          <div className="w-fit">
            <Button 
              className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-light lg:block hidden hover:cursor-pointer"
              onClick={() => setIsWaitlistOpen(true)}
            >
              Get Started
            </Button>
          </div>
        </div>
        <div className="w-[95%] md:w-[56%] border-[1px] border-gray-300 rounded-lg p-4 shadow-md" style={{opacity: 1, transform: 'translateY(0px)'}}>
          <ul className="max-w-2xl mx-auto w-full flex flex-col gap-2">
            {[
              {
                step: "01",
                title: "Browse & Choose",
                description: "Browse licensed consultants by your immigration need, expertise, and language preference",
                icon: "🔍"
              },
              {
                step: "02", 
                title: "Book & Pay",
                description: "Select your preferred time slot, pay securely, and upload documents if needed",
                icon: "📅"
              },
              {
                step: "03",
                title: "Meet & Get Expert Help",
                description: "Connect via secure video call and receive personalized immigration guidance", 
                icon: "📹"
              }
            ].map((processStep, index) => (
              <div key={index} className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50 rounded-xl cursor-pointer border border-gray-200 shadow-sm" style={{opacity: 1, transform: 'translateY(0px)'}}>
                <div className="flex gap-4 flex-col md:flex-row items-center w-full">
                  <div className="flex justify-center items-center">
                    <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center text-2xl relative">
                      {processStep.icon}
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {processStep.step}
                      </div>
                    </div>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="font-medium text-[18px] text-neutral-800 text-center md:text-left">{processStep.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{processStep.description}</p>
                  </div>
                </div>
                {index < 2 && (
                  <div className="md:flex hidden items-center justify-center ml-4">
                  </div>
                )}
              </div>
            ))}
          </ul>
        </div>
      </section>
      {/* Customer Reviews Section - Gale Inspired */}
      <section className="max-w-[90dvw] md:max-w-[78dvw] 3xl:max-w-[1300px] mx-auto px-4 mt-12">
        <div className="rounded-md flex flex-col antialiased bg-white items-left justify-center relative">
          <span className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">TESTIMONIALS</span>
          <h2 className="text-4xl md:text-5xl font-light mb-6 md:mb-8 text-gray-900">Customer Reviews</h2>
          <p className="text-gray-600 font-light mb-8 md:mb-10 flex items-center gap-3">
            <span className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
            </span>
            <span className="text-gray-600 font-semibold">4.7 out of 5 stars</span>
          </p>
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll-horizontal hover:pause-animation">
              {/* First set of testimonials */}
              {loading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="relative w-[350px] md:w-[400px] flex-shrink-0 rounded-2xl border border-gray-200 bg-gray-100 px-8 py-6 shadow-md mx-2 animate-pulse">
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-300 rounded w-20"></div>
                          <div className="h-3 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                testimonials.concat(testimonials).map((testimonial, index) => (
                <div key={index} className="relative w-[350px] md:w-[400px] flex-shrink-0 rounded-2xl border border-gray-200 bg-white px-8 py-6 shadow-md hover:shadow-lg transition-shadow duration-300 mx-2">
                  <blockquote>
                    <p className="text-gray-900 text-base leading-relaxed font-normal mb-6">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 text-sm font-semibold">
                          {testimonial.author?.split(' ').map(n => n[0]).join('') || '?'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-900 text-sm font-semibold">{testimonial.author}</span>
                        <span className="text-gray-500 text-xs">{testimonial.role} {testimonial.flag || ''}</span>
                        {testimonial.outcome && (
                          <span className="text-green-600 text-xs font-medium">{testimonial.outcome}</span>
                        )}
                      </div>
                    </div>
                  </blockquote>
                </div>
                ))
              )}
            </div>
          </div>
          <div className="pb-[80px]" style={{opacity: 1, transform: 'translateY(30px)'}}>
            <p className="text-sm">Let's do another successful case.</p>
            <div className="mt-4 flex flex-col md:flex-row gap-3 md:gap-4">
              <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-gray-800 h-11 rounded-full px-8 hover:cursor-pointer">
                Book a call to learn more
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Gale Inspired */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light mb-4 text-black">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Everything you need to know about our immigration consulting services
            </p>
          </div>

          <div className="space-y-3">
            {loading ? (
              // Loading skeleton for FAQs
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-lg bg-gray-100 animate-pulse">
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              faqs.filter(faq => faq.is_active).map((faq, index) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-all duration-200"
                >
                  <button
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  >
                    <span className="font-semibold text-lg text-black pr-4">
                      {faq.question}
                    </span>
                    <div className="flex-shrink-0 ml-4">
                      <ChevronDown
                        className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                          openFaq === faq.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50">
                      <div className="pt-4">
                        <p className="text-neutral-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-12 space-y-4">
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg font-medium transition-colors duration-200 mr-4"
              onClick={() => navigate('/faq')}
            >
              View All FAQs
            </Button>
            <Button
              className="bg-black text-white hover:bg-gray-800 px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Contact us for more questions
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

