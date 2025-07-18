import React from 'react';
import { Card, CardContent, BlurCard, GlassCard } from '../ui/Card';
import { Button } from '../Button';
import { CheckCircle, Clock, FileText, Shield, Users, Zap, Award, Target, Star, FileEdit, RefreshCw } from 'lucide-react';

export function ServicesPage() {
  return (
    <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] min-h-screen">
      {/* Hero Section */}
      <section className="pt-28 pb-24 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight [text-shadow:_0_2px_4px_rgba(0,0,0,0.3)]">
            Flexible Immigration Consulting Services. <span className="text-blue-400">Built Around Your Needs.</span>
          </h1>
          <p className="text-2xl text-gray-200 mb-8 max-w-4xl mx-auto [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">
            Only pay for what you need. No retainers, no delays.
          </p>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">
            From quick questions to full file reviews, our licensed consultants are here to help — on your terms.
          </p>
        </div>
      </section>

      {/* Service Cards Grid */}
      <section className="py-24 bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#475569] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 [text-shadow:_0_2px_4px_rgba(0,0,0,0.3)]">
              Comprehensive Immigration Services
            </h2>
            <p className="text-xl text-gray-200 [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)] max-w-3xl mx-auto">
              Professional immigration solutions tailored to your specific needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: <Clock className="h-6 w-6 text-white" />,
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
                icon: <FileText className="h-6 w-6 text-white" />,
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
                icon: <FileEdit className="h-6 w-6 text-white" />,
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
                icon: <RefreshCw className="h-6 w-6 text-white" />,
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
                icon: <Target className="h-6 w-6 text-white" />,
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
                icon: <Users className="h-6 w-6 text-white" />,
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
            ].map((service, index) => (
              <GlassCard
                key={index}
                className="shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                <CardContent className="p-8 relative overflow-hidden">
                  <div
                    className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg relative z-10"
                  >
                    {service.icon}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 relative z-10 [text-shadow:_0_2px_4px_rgba(0,0,0,0.3)]">
                    {service.title}
                  </h3>

                  <p className="text-gray-200 mb-4 relative z-10 leading-relaxed [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">{service.description}</p>

                  <ul className="space-y-2 mb-6 relative z-10">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-gray-200 text-sm [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-full mt-4 [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">
                    Learn More
                  </Button>
                </CardContent>
              </GlassCard>
            ))}
          </div>

          {/* Add-ons Section */}
          <GlassCard className="shadow-2xl mb-16">
            <CardContent className="p-12">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-white mb-4 [text-shadow:_0_2px_4px_rgba(0,0,0,0.3)]">Follow-Up Options & Add-ons</h3>
                <p className="text-gray-200 text-lg [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">Extend your support with these additional services</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    name: "Follow-Up Session",
                    price: "$50 CAD",
                    description: "30 mins within 2 weeks",
                    icon: <Users className="h-6 w-6 text-white" />,
                  },
                  {
                    name: "+15 Minute Extension",
                    price: "$20 CAD",
                    description: "Only if offered live by RCIC",
                    icon: <Clock className="h-6 w-6 text-white" />,
                  },
                  {
                    name: "Session Summary Email",
                    price: "$25 CAD",
                    description: "Written session summary",
                    icon: <FileText className="h-6 w-6 text-white" />,
                  },
                  {
                    name: "3-Session Bundle",
                    price: "$150 CAD",
                    description: "3 × 30-minute sessions",
                    icon: <Zap className="h-6 w-6 text-white" />,
                  },
                ].map((addon, index) => (
                  <div
                    key={index}
                    className="p-6 bg-gray-500/20 backdrop-blur-sm rounded-xl text-center hover:bg-gray-400/30 transition-all duration-300 border border-gray-400/30"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
                      {addon.icon}
                    </div>
                    <div className="font-bold text-white mb-2 [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">{addon.name}</div>
                    <div className="text-2xl font-bold text-blue-300 mb-2 [text-shadow:_0_2px_4px_rgba(0,0,0,0.3)]">{addon.price}</div>
                    <div className="text-sm text-gray-200 [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">{addon.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </GlassCard>

          {/* Comparison Table */}
          <GlassCard className="border-0 shadow-2xl">
            <CardContent className="p-12">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-white mb-4 [text-shadow:_0_2px_4px_rgba(0,0,0,0.3)]">Compare Services</h3>
                <p className="text-gray-200 text-lg [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">Choose the right service for your needs</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-400/50">
                      <th className="text-left py-4 px-6 font-bold text-white [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">Feature</th>
                      <th className="text-center py-4 px-6 font-bold text-blue-300 [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">Simple Consultation</th>
                      <th className="text-center py-4 px-6 font-bold text-indigo-300 [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">File Review</th>
                      <th className="text-center py-4 px-6 font-bold text-purple-300 [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">File Review + Summary</th>
                    </tr>
                  </thead>
                  <tbody>
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
                      <tr key={index} className="border-b border-gray-400/30">
                        <td className="py-4 px-6 font-medium text-white [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">{row.feature}</td>
                        <td className="py-4 px-6 text-center">
                          {typeof row.simple === "boolean" ? (
                            row.simple ? (
                              <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-gray-200 [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">{row.simple}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {typeof row.fileReview === "boolean" ? (
                            row.fileReview ? (
                              <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-gray-200 [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">{row.fileReview}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {typeof row.summary === "boolean" ? (
                            row.summary ? (
                              <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-gray-200 [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">{row.summary}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </GlassCard>
        </div>
      </section>

      {/* Why Pay-Per-Session */}
      <section className="py-24 bg-gradient-to-br from-gray-800 via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-indigo-900/20 to-purple-900/20 backdrop-blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 [text-shadow:_0_2px_4px_rgba(0,0,0,0.3)]">One Price. No Retainers. Real Help.</h2>
            <p className="text-xl text-gray-200 mb-12 leading-relaxed [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">
              Most immigration firms want you to commit to full-service retainers. We let you pay for just what you need
              — whether that's 30 minutes of quick advice, or a thorough document review. It's expert help, with zero
              pressure.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: <Shield className="h-8 w-8 text-white" />,
                  title: "Flat-rate pricing",
                  description: "No surprises or hidden fees",
                },
                {
                  icon: <Users className="h-8 w-8 text-white" />,
                  title: "No obligation",
                  description: "No packages or retainers required",
                },
                {
                  icon: <CheckCircle className="h-8 w-8 text-white" />,
                  title: "Choose your expert",
                  description: "Select by expertise and language",
                },
              ].map((benefit, index) => (
                <div key={index} className="text-center p-6 bg-gray-500/20 backdrop-blur-sm rounded-xl hover:bg-gray-400/30 transition-all duration-300 border border-gray-400/30">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">{benefit.title}</h3>
                  <p className="text-gray-200 [text-shadow:_0_1px_2px_rgba(0,0,0,0.2)]">{benefit.description}</p>
                </div>
              ))}
            </div>

            <Button
              variant="blur-primary"
              size="lg"
              className="px-12 py-4 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
            >
              Find a Consultant
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}