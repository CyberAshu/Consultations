import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../shared/Button';
import { Clock, FileText, Shield, Users, Zap, Target, FileEdit, RefreshCw, ArrowRight, Globe, UserCheck, MapPin, HelpCircle } from 'lucide-react';
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
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            The Canadian immigration system can be overwhelming. Whether you're applying for a study permit, exploring PR, or recovering from a refusal, you deserve help that's honest, expert, and focused on results not retainers.
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-10">
            This page helps you choose the right service for your specific needs. Every session is with a licensed RCIC and designed to give you clear next steps, document support, and peace of mind.
          </p>
        </div>
      </section>

      {/* Service Cards Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 tracking-wider uppercase mb-2">Our Services</h2>
            <h3 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              Immigration Solutions Tailored to You
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choose from our comprehensive range of professional immigration services, 
              all backed by licensed RCICs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
          {
                icon: <Clock className="h-8 w-8" />,
                title: "Quick Immigration Advice Session",
                description: "30, 45, 60 min. Live 1-on-1 session with a licensed RCIC.",
                features: [
                  "Reliable answers from a licensed RCIC.",
                  "Clarification on documents, timelines, or eligibility.",
                  "Trusted advice before you take your next step.",
                  "Ideal for first-time applicants or people seeking clarity.",
                  "No document prep required just book and talk."
                ],
                color: "blue"
              },
              {
                icon: <FileText className="h-8 w-8" />,
                title: "Eligibility Check & Program Matching",
                description: "Personalized review of your qualifications.",
                features: [
                  "A clear list of immigration options that match.",
                  "Advice on which programs are realistic or risky.",
                  "Consultant reviews your profile and background.",
                  "Get matched with the most realistic Canadian immigration pathways.",
                  "Advice on study permits, work permits, PR, Express Entry, etc."
                ],
                color: "green"
              },
              {
                icon: <FileEdit className="h-8 w-8" />,
                title: "Strategic Immigration Planning",
                description: "Build a long-term or multi-step immigration roadmap.",
                features: [
                  "Side-by-side comparison of your possible paths.",
                  "Compare multiple programs and options based on your goals.",
                  "CRS improvement tips, timelines, and risk analysis.",
                  "Ideal for people with complex profiles or multiple pathways.",
                  "Tips for maximizing points or preparing your file."
                ],
                color: "purple"
              },
              {
                icon: <RefreshCw className="h-8 w-8" />,
                title: "Final Application Review",
                description: "Document and form check for accuracy and completeness.",
                features: [
                  "Upload your draft forms and supporting documents.",
                  "Consultant checks for errors, missing info, or red flags.",
                  "Receive expert feedback before you submit to IRCC.",
                  "Increases your chances of approval without hiring a full representative.",
                  "Suggestions to improve supporting evidence."
                ],
                color: "orange"
              },
              {
                icon: <Target className="h-8 w-8" />,
                title: "Refusal Letter Evaluation",
                description: "Clear breakdown of the refusal letter.",
                features: [
                  "The consultant reviews your IRCC refusal letter in detail.",
                  "Understand what went wrong and what to do next.",
                  "Learn whether to reapply, appeal, or change strategy.",
                  "Helps avoid repeating the same mistakes.",
                  "Expert insights into what likely went wrong."
                ],
                color: "indigo"
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "International Applicant Guidance",
                description: "Tailored guidance for your country of residence.",
                features: [
                  "Designed for clients applying from outside Canada.",
                  "Tailored advice based on your country, visa type, and supporting documents.",
                  "Consultant helps you prove ties to home and meet Canadian standards.",
                  "Especially helpful for study permits, visitor visas, or first-time applicants.",
                  "Culturally aware advice from consultants who know your region."
                ],
                color: "teal"
              },
              {
                icon: <HelpCircle className="h-8 w-8" />,
                title: "Expert Support for DIY Applicants",
                description: "Help with complex form fields.",
                features: [
                  "Help with filling out forms, GCKey errors, or tricky application sections.",
                  "Ask about document prep, cover letters, letters of explanation, and more.",
                  "Stay in control of your own application, with expert support when needed.",
                  "Ideal for confident applicants who need help with specific items.",
                  "Troubleshooting tech or GCKey issues."
                ],
                color: "bluegray"
              },
              {
                icon: <MapPin className="h-8 w-8" />,
                title: "Future Path Planning (Students, Workers, PGWP Holders)",
                description: "Timeline planning (PGWP → PNP → PR).",
                features: [
                  "For those already in Canada planning to stay longer or apply for PR.",
                  "Understand your next steps: Express Entry, PNP, bridging work permits, etc.",
                  "Consultant helps you build a timeline around permit expiry.",
                  "Prevent last-minute panic by planning 1–2 years in advance.",
                  "Answers to what you should do now to qualify later."
                ],
                color: "emerald"
              }
            ].map((service, index) => {
              return (
                <div 
                  key={index} 
                  ref={(el: HTMLDivElement | null) => { serviceRefs.current[`service-${index}`] = el; }}
                  className="card-animate"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 bg-white group">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300">
                        <div className="text-gray-600 group-hover:text-blue-600">{service.icon}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          PROFESSIONAL
                        </div>
                      </div>
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed text-sm">{service.description}</p>
                      
                      <ul className="space-y-2 mb-6">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2 text-gray-700 text-sm">
                            <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="text-center py-4">
                        <Button 
                          className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition-all duration-200"
                          onClick={() => navigate('/consultants')}
                        >
                          Book Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
