import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../shared/Button';
import { Clock, FileText, Shield, Users, Zap, Target, FileEdit, RefreshCw, ArrowRight, Globe, UserCheck, MapPin, HelpCircle, CheckCircle, Star } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function ServicesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetServiceId = searchParams.get('service');
  const serviceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    // Service ID mappings - moved inside useEffect to avoid dependency warning
    const serviceIdMap = {
      'quick-immigration-advice': 0,
      'eligibility-check-program-matching': 1,
      'strategic-immigration-planning': 2,
      'final-application-review': 3,
      'refusal-letter-evaluation': 4,
      'international-applicant-guidance': 5
    };

    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          // Once animated, stop observing this element
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const cards = document.querySelectorAll('.card-animate');
      cards.forEach((card, index) => {
        (card as HTMLElement).style.animationDelay = `${index * 0.08}s`;
        observer.observe(card);
      });

      // Scroll to specific service if query parameter exists
      if (targetServiceId && serviceIdMap[targetServiceId as keyof typeof serviceIdMap] !== undefined) {
        const serviceIndex = serviceIdMap[targetServiceId as keyof typeof serviceIdMap];
        const targetElement = serviceRefs.current[`service-${serviceIndex}`];
        if (targetElement) {
          setTimeout(() => {
            targetElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            // Add highlight effect
            targetElement.classList.add('highlight-service');
            setTimeout(() => {
              targetElement.classList.remove('highlight-service');
            }, 3000);
          }, 500);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [targetServiceId]);

  return (
    <div className="min-h-screen bg-white">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .card-animate {
          opacity: 0;
          transform: translateY(50px) scale(0.9);
        }
        
        .card-animate.animate-in {
          animation: slideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .highlight-service {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5) !important;
          border-color: #3b82f6 !important;
          background-color: #fef3cd !important;
        }
        `
      }} />
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight tracking-tight">
            Professional Immigration 
            <span className="text-blue-600 block">Consulting Services</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Expert immigration guidance tailored to your needs. Every session with a licensed RCIC.
          </p>
        </div>
      </section>

      {/* Service Cards Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">

          <div className="max-w-7xl mx-auto">
            {[
              {
                icon: <Clock className="h-12 w-12" />,
                title: "Quick Immigration Advice Session",
                subtitle: "Who it's for:",
                whoFor: "You're new to the process or facing a few 'What should I do?' questions.",
                description: "What it covers:",
                features: [
                  "30, 45, 60 min. Live 1-on-1 session with a licensed RCIC.",
                  "Reliable answers from a licensed RCIC.",
                  "Clarification on documents, timelines, or eligibility.",
                  "Trusted advice before you take your next step.",
                  "Ideal for first-time applicants or people seeking clarity.",
                  "No document prep required just book and talk."
                ],
                benefit: "No more guessing. Just clarity from someone who knows exactly how the system works.",
                mainBenefit: "Get fast, trustworthy answers and peace of mind without long waits or commitments.",
                cta: "Book Your Session",
                gradient: "from-blue-500 to-blue-700",
                bgGradient: "from-blue-50 to-indigo-50",
                image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&h=400&fit=crop&crop=center"
              },
              {
                icon: <FileText className="h-12 w-12" />,
                title: "Eligibility Check & Program Matching",
                subtitle: "Who it's for:",
                whoFor: "You're unsure which immigration pathway fits your background: study, Express Entry, PNP, work permit?",
                description: "What it covers:",
                features: [
                  "Personalized review of your qualifications",
                  "A clear list of immigration options that match",
                  "Advice on which programs are realistic or risky",
                  "Consultant reviews your profile and background",
                  "Get matched with the most realistic Canadian immigration pathways",
                  "Understand which programs you qualify for and which you don't"
                ],
                benefit: "Avoid wasting time and money on applications you don't qualify for.",
                mainBenefit: "Avoid rejections by applying to programs you're actually eligible for.",
                cta: "Find Out If You Qualify",
                gradient: "from-green-500 to-emerald-700",
                bgGradient: "from-green-50 to-emerald-50",
                image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=400&fit=crop&crop=center"
              },
              {
                icon: <FileEdit className="h-12 w-12" />,
                title: "Strategic Immigration Planning",
                subtitle: "Who it's for:",
                whoFor: "You're weighing multiple immigration options and want to choose the most secure or fastest route.",
                description: "What it covers:",
                features: [
                  "Side-by-side comparison of your possible paths",
                  "Build a long-term or multi-step immigration roadmap",
                  "Compare multiple programs and options based on your goals",
                  "CRS improvement tips, timelines, and risk analysis",
                  "Ideal for people with complex profiles or multiple pathways",
                  "Tips for maximizing points or preparing your file"
                ],
                benefit: "A plan you can trust. You'll know where to start, what to expect, and what it'll take to succeed.",
                mainBenefit: "Leave with a clear, personalized strategy not guesswork or generic advice.",
                cta: "Build My Immigration Plan",
                gradient: "from-purple-500 to-purple-700",
                bgGradient: "from-purple-50 to-violet-50",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=400&fit=crop&crop=center"
              },
              {
                icon: <RefreshCw className="h-12 w-12" />,
                title: "Final Application Review",
                subtitle: "Who it's for:",
                whoFor: "You've done the hard work yourself but want expert eyes before submitting.",
                description: "What it covers:",
                features: [
                  "Document and form check for accuracy and completeness",
                  "Upload your draft forms and supporting documents",
                  "Consultant checks for errors, missing info, or red flags",
                  "Receive expert feedback before you submit to IRCC",
                  "Increases your chances of approval without hiring a full representative",
                  "Suggestions to improve supporting evidence"
                ],
                benefit: "Catch errors before IRCC does. Increase your approval chances without hiring a full legal team.",
                mainBenefit: "Catch costly mistakes before submission and maximize your chances of success.",
                cta: "Get My File Reviewed",
                gradient: "from-orange-500 to-red-600",
                bgGradient: "from-orange-50 to-red-50",
                image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500&h=400&fit=crop&crop=center"
              },
              {
                icon: <Target className="h-12 w-12" />,
                title: "Refusal Letter Evaluation",
                subtitle: "Who it's for:",
                whoFor: "Your application was refused and you're not sure why—or what to do next.",
                description: "What it covers:",
                features: [
                  "Clear breakdown of the refusal letter",
                  "The consultant reviews your IRCC refusal letter in detail",
                  "Understand what went wrong and what to do next",
                  "Learn whether to reapply, appeal, or change strategy",
                  "Helps avoid repeating the same mistakes",
                  "Step-by-step suggestions to fix or reapply"
                ],
                benefit: "You'll stop guessing and start recovering with a concrete path forward.",
                mainBenefit: "Turn a refusal into a smarter, stronger plan with expert insights.",
                cta: "Fix My Refused Application",
                gradient: "from-indigo-500 to-blue-700",
                bgGradient: "from-indigo-50 to-blue-50",
                image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=400&fit=crop&crop=center"
              },
              {
                icon: <Globe className="h-12 w-12" />,
                title: "International Applicant Guidance",
                subtitle: "Who it's for:",
                whoFor: "You're applying from abroad and want to prepare your documents and application properly.",
                description: "What it covers:",
                features: [
                  "Tailored guidance for your country of residence",
                  "Designed for clients applying from outside Canada",
                  "Tailored advice based on your country, visa type, and supporting documents",
                  "Consultant helps you prove ties to home and meet Canadian standards",
                  "Support with proving ties, finances, and intent",
                  "Culturally aware advice from consultants who know your region"
                ],
                benefit: "Confidence that your file meets Canadian expectations, even from outside the country.",
                mainBenefit: "Apply from overseas with confidence and clarity, no cultural gaps, no guesswork.",
                cta: "Start My Canada Journey",
                gradient: "from-teal-500 to-cyan-700",
                bgGradient: "from-teal-50 to-cyan-50",
                image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=400&fit=crop&crop=center"
              },
              {
                icon: <HelpCircle className="h-12 w-12" />,
                title: "Expert Support for DIY Applicants",
                subtitle: "Who it's for:",
                whoFor: "You're managing your application on your own, but stuck on a specific issue.",
                description: "What it covers:",
                features: [
                  "Help with complex form fields",
                  "Help with filling out forms, GCKey errors, or tricky application sections",
                  "Ask about document prep, cover letters, letters of explanation, and more",
                  "Stay in control of your own application, with expert support when needed",
                  "Support letters and explanation drafts",
                  "Troubleshooting tech or GCKey issues"
                ],
                benefit: "Stay in control, but avoid costly mistakes. Get expert help only where you need it.",
                mainBenefit: "Maintain control while getting targeted expert assistance for specific challenges.",
                cta: "Get Help With My Forms",
                gradient: "from-slate-500 to-gray-700",
                bgGradient: "from-slate-50 to-gray-50",
                image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=500&h=400&fit=crop&crop=center"
              },
              {
                icon: <MapPin className="h-12 w-12" />,
                title: "Future Path Planning (Students, Workers, PGWP Holders)",
                subtitle: "Who it's for:",
                whoFor: "You're already in Canada and want to know your next steps toward permanent residence.",
                description: "What it covers:",
                features: [
                  "Timeline planning (PGWP → PNP → PR)",
                  "For those already in Canada planning to stay longer or apply for PR",
                  "Understand your next steps: Express Entry, PNP, bridging work permits, etc.",
                  "Consultant helps you build a timeline around permit expiry",
                  "Support for bridging permits or status changes",
                  "Answers to what you should do now to qualify later"
                ],
                benefit: "Avoid last-minute panic. Plan your next two years in one session.",
                mainBenefit: "Secure your long-term stay in Canada with a clear, proactive plan.",
                cta: "Plan My Future in Canada",
                gradient: "from-emerald-500 to-green-700",
                bgGradient: "from-emerald-50 to-green-50",
                image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=400&fit=crop&crop=center"
              }
            ].map((service, index) => {
              const isEven = index % 2 === 0;
              return (
                <div 
                  key={index} 
                  ref={(el: HTMLDivElement | null) => { serviceRefs.current[`service-${index}`] = el; }}
                  className="group relative mb-16 last:mb-0"
                >
                  <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-start`}>
                    {/* Image Section */}
                    <div className="flex-shrink-0 lg:w-1/2">
                      <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[4/3] group-hover:shadow-xl transition-shadow duration-300">
                        {/* Background Image */}
                        {service.image ? (
                          <img 
                            src={service.image} 
                            alt={service.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                        )}
                        
                        {/* Dark overlay for better text visibility */}
                        <div className="absolute inset-0 bg-black/30"></div>
                        
                        {/* Icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="p-6 bg-white/95 rounded-full shadow-lg">
                            <div className="text-gray-700">
                              {service.icon}
                            </div>
                          </div>
                        </div>
                        
                        {/* Service number */}
                        <div className="absolute top-4 left-4 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        
                        {/* Professional badge */}
                        <div className="absolute bottom-4 right-4 bg-white/95 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                          RCIC Licensed
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 lg:py-8">
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full mb-3">
                          {service.subtitle.replace(':', '')}
                        </span>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">{service.whoFor}</p>
                      </div>
                      
                      <div className="mb-8">
                        <h4 className="text-xl font-semibold text-gray-900 mb-4">{service.description}</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {service.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-600 text-sm leading-relaxed">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                          Key Benefit
                        </h4>
                        <p className="text-gray-700 font-medium text-lg mb-2">{service.mainBenefit}</p>
                        <p className="text-gray-600 text-sm italic">{service.benefit}</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          className="bg-gray-900 text-white font-semibold py-4 px-8 rounded-lg text-lg hover:bg-gray-800 transition-all duration-300 hover:shadow-lg inline-flex items-center justify-center group-hover:scale-105"
                          onClick={() => navigate('/consultants')}
                        >
                          {service.cta}
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Connecting line for flow */}
                  {index < 7 && (
                    <div className="hidden lg:block absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                      <div className="w-px h-16 bg-gradient-to-b from-gray-300 to-transparent"></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </section>
      
      {/* Additional Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 tracking-wider uppercase mb-2">Additional Options</h2>
            <h3 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              Extend Your Support
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Enhance your consultation experience with these additional services and packages.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                name: "Follow-Up Session",
                description: "Schedule additional 30-minute sessions within 2 weeks of your initial consultation for continued support",
                icon: <Users className="h-8 w-8" />
              },
              {
                name: "Session Extension",
                description: "Extend your current session by 15 minutes when offered live by your RCIC consultant",
                icon: <Clock className="h-8 w-8" />
              },
              {
                name: "Session Summary",
                description: "Receive a detailed written summary of your consultation session via email",
                icon: <FileText className="h-8 w-8" />
              },
              {
                name: "Multi-Session Bundle",
                description: "Save with bundled packages including 3 sessions and comprehensive planning tools",
                icon: <Zap className="h-8 w-8" />
              },
            ].map((addon, index) => {
              return (
                <Card key={index} className="card-animate h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 bg-white group">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300">
                        <div className="text-gray-600 group-hover:text-blue-600">{addon.icon}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          ADDON
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <h4 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{addon.name}</h4>
                      <p className="text-gray-600 leading-relaxed text-sm">{addon.description}</p>
                    </div>
                    
                    <div className="mt-auto pt-4">
                      <div className="w-full h-1 bg-gray-100 rounded-full">
                        <div className="w-1/3 h-1 bg-blue-600 rounded-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
      {/* Professional Services Summary */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
                Professional Immigration Guidance
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Each service is designed by licensed RCICs to provide you with clear, actionable guidance 
                for your Canadian immigration journey.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white border border-gray-200 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg mx-auto mb-6 w-fit">
                    <UserCheck className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Licensed Professionals</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">All consultations conducted by licensed RCICs with years of experience</p>
                  <div className="mt-6 w-12 h-1 bg-gray-200 rounded-full mx-auto"></div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg mx-auto mb-6 w-fit">
                    <Shield className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Transparent Pricing</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Pay only for the specific help you need with no hidden fees or retainers</p>
                  <div className="mt-6 w-12 h-1 bg-gray-200 rounded-full mx-auto"></div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg mx-auto mb-6 w-fit">
                    <Target className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Focused Solutions</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Tailored advice for your specific situation and immigration goals</p>
                  <div className="mt-6 w-12 h-1 bg-gray-200 rounded-full mx-auto"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
