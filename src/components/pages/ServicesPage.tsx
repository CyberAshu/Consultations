import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../Button';
import { CheckCircle, Clock, FileText, Shield, Users, Zap, Target, FileEdit, RefreshCw, ArrowRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ServicesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            Professional Immigration 
            <span className="text-blue-600 block">Consulting Services</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Transparent pricing. Expert guidance. No retainers required.
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-10">
            Choose from flexible service options designed around your specific immigration needs, 
            backed by licensed RCICs you can trust.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200"
              onClick={() => navigate('/consultants')}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book Consultation
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all duration-200"
            >
              Compare Services
            </Button>
          </div>
        </div>
      </section>

      {/* Service Cards Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 tracking-wider uppercase mb-2">Our Services</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
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
                title: "General Consultations",
                description: "Time-based immigration consultations with personalized guidance",
                features: [
                  "30/45/60 min pay-per-session model",
                  "IRCC programs & eligibility assessment",
                  "Portal navigation & documentation help",
                  "Comprehensive options assessment"
                ],
                price: "From $60 CAD",
                color: "blue"
              },
              {
                icon: <FileText className="h-8 w-8" />,
                title: "Document Review",
                description: "Professional review of your immigration documents",
                features: [
                  "IRCC forms review & validation",
                  "SOP & LOE evaluation",
                  "Refusal analysis & recommendations",
                  "Live feedback discussion"
                ],
                price: "From $80 CAD",
                color: "green"
              },
              {
                icon: <FileEdit className="h-8 w-8" />,
                title: "Form Filling Assistance",
                description: "Step-by-step guidance for complex immigration forms",
                features: [
                  "IMM forms & GCKey help",
                  "PR & Sponsorship forms",
                  "TRV & LMIA guidance",
                  "Non-submission support"
                ],
                price: "From $70 CAD",
                color: "purple"
              },
              {
                icon: <RefreshCw className="h-8 w-8" />,
                title: "Follow-up Services",
                description: "Ongoing support and session extensions",
                features: [
                  "+15 min session extensions",
                  "Follow-up bookings",
                  "IRCC response planning",
                  "Procedural fairness help"
                ],
                price: "From $20 CAD",
                color: "orange"
              },
              {
                icon: <Target className="h-8 w-8" />,
                title: "Program-Specific Help",
                description: "Specialized support for specific immigration programs",
                features: [
                  "Express Entry & PNP guidance",
                  "Study/Work Permits",
                  "Family Sponsorship",
                  "Visitor & Super Visas"
                ],
                price: "From $90 CAD",
                color: "indigo"
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Multi-Session Packages",
                description: "Comprehensive support plans for complex cases",
                features: [
                  "3-session bundle available",
                  "PR Planning Kit",
                  "Student-to-PR Track",
                  "Custom packages available"
                ],
                price: "From $150 CAD",
                color: "teal"
              }
            ].map((service, index) => {
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600",
                green: "bg-green-100 text-green-600",
                purple: "bg-purple-100 text-purple-600",
                orange: "bg-orange-100 text-orange-600",
                indigo: "bg-indigo-100 text-indigo-600",
                teal: "bg-teal-100 text-teal-600"
              };
              
              return (
                <Card key={index} className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className={`w-16 h-16 ${colorClasses[service.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center mb-6`}>
                      {service.icon}
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                      
                      <ul className="space-y-3 mb-8">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3 text-gray-700 text-sm">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="text-center mb-4">
                        <span className="text-2xl font-bold text-gray-900">{service.price}</span>
                      </div>
                      <Button 
                        className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition-all duration-200"
                        onClick={() => navigate('/consultants')}
                      >
                        Book Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

        </div>
      </section>
      
      {/* Additional Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 tracking-wider uppercase mb-2">Additional Options</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
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
                icon: <Users className="h-8 w-8" />,
                color: "blue"
              },
              {
                name: "Session Extension",
                description: "Extend your current session by 15 minutes when offered live by your RCIC consultant",
                icon: <Clock className="h-8 w-8" />,
                color: "green"
              },
              {
                name: "Session Summary",
                description: "Receive a detailed written summary of your consultation session via email",
                icon: <FileText className="h-8 w-8" />,
                color: "purple"
              },
              {
                name: "Multi-Session Bundle",
                description: "Save with bundled packages including 3 sessions and comprehensive planning tools",
                icon: <Zap className="h-8 w-8" />,
                color: "orange"
              },
            ].map((addon, index) => {
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600",
                green: "bg-green-100 text-green-600",
                purple: "bg-purple-100 text-purple-600",
                orange: "bg-orange-100 text-orange-600"
              };
              
              return (
                <Card key={index} className="text-center p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 ${colorClasses[addon.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      {addon.icon}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">{addon.name}</h4>
                    <p className="text-gray-600 leading-relaxed">{addon.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Service Comparison Table */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 tracking-wider uppercase mb-2">Service Comparison</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Choose the Right Service
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Compare our main service types to find the perfect match for your immigration needs.
            </p>
          </div>

          <Card className="overflow-hidden shadow-2xl border-0">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-6 px-6 font-bold text-gray-900 text-lg">Feature</th>
                      <th className="text-center py-6 px-6 font-bold text-blue-600 text-lg">Simple Consultation</th>
                      <th className="text-center py-6 px-6 font-bold text-green-600 text-lg">File Review</th>
                      <th className="text-center py-6 px-6 font-bold text-purple-600 text-lg">File Review + Summary</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {[
                      {
                        feature: "Live Zoom Session",
                        simple: true,
                        fileReview: true,
                        summary: true,
                      },
                      {
                        feature: "Document Upload",
                        simple: "Optional",
                        fileReview: true,
                        summary: true,
                      },
                      {
                        feature: "Pre-call Document Review",
                        simple: false,
                        fileReview: true,
                        summary: true,
                      },
                      {
                        feature: "Written Follow-Up Summary",
                        simple: false,
                        fileReview: false,
                        summary: true,
                      },
                      {
                        feature: "Ideal For",
                        simple: "General questions",
                        fileReview: "SOP, forms",
                        summary: "Detailed files, appeals",
                      },
                    ].map((row, index) => (
                      <tr key={index} className={`border-t border-gray-100 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                        <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                        <td className="py-4 px-6 text-center">
                          {typeof row.simple === "boolean" ? (
                            row.simple ? (
                              <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-gray-700 font-medium">{row.simple}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {typeof row.fileReview === "boolean" ? (
                            row.fileReview ? (
                              <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-gray-700 font-medium">{row.fileReview}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {typeof row.summary === "boolean" ? (
                            row.summary ? (
                              <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-gray-700 font-medium">{row.summary}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Choose Our Approach */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 tracking-tight">
              Transparent. Flexible. Professional.
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Most immigration firms require expensive retainers and long commitments. 
              We believe you should pay only for the specific help you need, when you need it.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: <Shield className="h-12 w-12" />,
                  title: "Transparent Pricing",
                  description: "Clear, upfront costs with no hidden fees or surprise charges",
                  color: "blue"
                },
                {
                  icon: <Users className="h-12 w-12" />,
                  title: "No Commitments",
                  description: "Pay per session with no long-term contracts or retainer requirements",
                  color: "green"
                },
                {
                  icon: <CheckCircle className="h-12 w-12" />,
                  title: "Choose Your Expert",
                  description: "Select consultants by expertise, language, and availability",
                  color: "purple"
                },
              ].map((benefit, index) => {
                const colorClasses = {
                  blue: "bg-blue-100 text-blue-600",
                  green: "bg-green-100 text-green-600",
                  purple: "bg-purple-100 text-purple-600"
                };
                
                return (
                  <Card key={index} className="text-center p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className={`w-20 h-20 ${colorClasses[benefit.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                        {benefit.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Button
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-12 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
              onClick={() => navigate('/consultants')}
            >
              Find Your Consultant
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}