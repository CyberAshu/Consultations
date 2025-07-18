import React from 'react'
import { Card, CardContent, BlurCard } from '../ui/Card'
import { Button } from '../Button'
import { Globe, Heart, Shield, Lightbulb, CheckCircle, Users, Award, Target, Star } from 'lucide-react'

export function AboutPage() {
  return (
    <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] min-h-screen">
      {/* Hero Section */}
      <section className="pt-28 pb-24 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight text-shadow-lg">
            Why We Built <span className="text-blue-400">This Platform</span>
          </h1>
          <p className="text-2xl text-gray-200 mb-8 max-w-4xl mx-auto text-shadow-sm">Real Immigration Help. From Real Experts.</p>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto text-shadow-sm">Born from our own journey, built to empower yours.</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 text-shadow-lg">
                This Started With a <span className="text-blue-400">Frustrated Search</span> for Help.
              </h2>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p className="text-shadow-sm">
                  We created this platform after facing the immigration system ourselves. Endless confusion. Unreturned
                  emails. Expensive retainers just to ask a single question. We realized how hard it was to find honest,
                  licensed advice—especially without risking thousands of dollars up front.
                </p>
                <p className="text-shadow-sm">
                  So we built what we wished we had: a secure, flexible, transparent platform where anyone can book time
                  with a licensed RCIC, get expert advice, and move forward with confidence.
                </p>
              </div>
            </div>
            <div className="relative">
              <BlurCard className="overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-105">
                <div className="w-full h-[500px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent"></div>
                  <div className="relative z-10 text-center">
                    <Users className="h-24 w-24 text-white mb-4 mx-auto" />
                    <span className="text-white text-lg font-semibold text-shadow-md">Immigration Success Stories</span>
                  </div>
                </div>
              </BlurCard>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-24 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-16 left-16 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 right-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 text-shadow-lg">What We Stand For</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto text-shadow-sm">Four pillars that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Globe className="h-10 w-10" />,
                title: "Access",
                description: "Book from anywhere, pay per session—no long-term commitment.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: <Shield className="h-10 w-10" />,
                title: "Trust",
                description: "Every consultant is licensed and verified.",
                color: "from-green-500 to-green-600",
              },
              {
                icon: <Lightbulb className="h-10 w-10" />,
                title: "Clarity",
                description: "Transparent pricing. No hidden fees.",
                color: "from-yellow-500 to-orange-600",
              },
              {
                icon: <Heart className="h-10 w-10" />,
                title: "Empowerment",
                description: "You stay in control. We just help you make smarter moves.",
                color: "from-purple-500 to-pink-600",
              },
            ].map((pillar, index) => (
              <BlurCard
                key={index}
                className="text-center transition-all duration-500 transform hover:-translate-y-2 group hover:shadow-2xl"
              >
                <CardContent className="p-10">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${pillar.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500`}
                  >
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{pillar.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
                </CardContent>
              </BlurCard>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Help Section */}
      <section className="py-24 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 text-shadow-lg">
              Built for <span className="text-blue-400">People Like You</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto text-shadow-sm">
              Whether it's your first application or your fifth, we're here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🎓",
                title: "International Students",
                question: "Should I switch to PGWP now or wait?",
                bgColor: "from-blue-500/20 to-blue-600/20",
              },
              {
                icon: "🧑‍🤝‍🧑",
                title: "Spousal Applicants",
                question: "Are my relationship docs strong enough?",
                bgColor: "from-pink-500/20 to-purple-600/20",
              },
              {
                icon: "💼",
                title: "Workers",
                question: "Can I apply for PR under Express Entry yet?",
                bgColor: "from-green-500/20 to-emerald-600/20",
              },
              {
                icon: "🏡",
                title: "Families & Sponsors",
                question: "How do I bring my parents here safely?",
                bgColor: "from-orange-500/20 to-red-600/20",
              },
            ].map((persona, index) => (
              <BlurCard
                key={index}
                className="text-center transition-all duration-500 transform hover:-translate-y-2 group hover:shadow-2xl"
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${persona.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg`}>
                    {persona.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{persona.title}</h3>
                  <p className="text-gray-600 italic">"{persona.question}"</p>
                </CardContent>
              </BlurCard>
            ))}
          </div>
        </div>
      </section>

      {/* Our Community Section */}
      <section className="py-24 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 text-shadow-lg">
              <span className="text-blue-400">RCICs</span> You Can Trust
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed text-shadow-sm">
              Our consultants are all licensed members of the College of Immigration and Citizenship Consultants (CICC).
              They bring years of practical experience and a client-first mindset. You'll see their license number,
              specialty areas, languages spoken, and availability right on their profile.
            </p>
            <Button
              variant="blur-primary"
              size="lg"
              className="px-12 py-4 text-xl font-bold rounded-full transition-all duration-500 transform hover:scale-105"
            >
              Meet Our RCICs
            </Button>
          </div>
        </div>
      </section>

      {/* Our Promise Section */}
      <section className="py-24 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 text-shadow-lg">
              Safe. Private. <span className="text-blue-400">On Your Terms.</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed text-shadow-sm">
              We built this platform to protect your trust, your data, and your time. Your bookings are confidential.
              Your documents are secure. And you never pay for more than you use.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: <Shield className="h-8 w-8" />,
                  title: "Secure & Private",
                  description: "Your data is encrypted and protected",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  icon: <CheckCircle className="h-8 w-8" />,
                  title: "Licensed Experts",
                  description: "All consultants are CICC verified",
                  color: "from-green-500 to-green-600",
                },
                {
                  icon: <Heart className="h-8 w-8" />,
                  title: "Client-First",
                  description: "Your success is our priority",
                  color: "from-purple-500 to-purple-600",
                },
              ].map((promise, index) => (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${promise.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                    {promise.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{promise.title}</h3>
                  <p className="text-gray-300">{promise.description}</p>
                </div>
              ))}
            </div>

            <Button
              variant="blur-secondary"
              size="lg"
              className="px-12 py-4 text-xl font-bold rounded-full transition-all duration-500 transform hover:scale-105"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <section className="py-16 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <p className="text-xl text-gray-300 max-w-3xl mx-auto text-shadow-sm">
            The easiest way to get licensed Canadian immigration help—no stress, no surprises.
          </p>
        </div>
      </section>
    </div>
  )
}
