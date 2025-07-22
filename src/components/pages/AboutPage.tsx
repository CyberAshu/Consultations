import React from 'react'
import { Card, CardContent, BlurCard } from '../ui/Card'
import { Button } from '../Button'
import { Globe, Heart, Shield, Lightbulb, CheckCircle, Users, Award, Target, Star } from 'lucide-react'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-white">
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
              Why We Built 
              <span className="block font-semibold text-blue-400">This Platform</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-6 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Real Immigration Help. From Real Experts.
            </p>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto font-light drop-shadow-md">
              Born from our own journey, built to empower yours.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section - Gale Inspired */}
      <section className="max-w-[95dvw] md:max-w-[78dvw] 2.5xl:max-w-[1300px] mx-auto md:px-4 py-16 md:py-24 flex flex-col justify-center items-center md:items-start md:flex-row md:gap-10">
        <div className="px-[5dvw] md:px-0 transition-all duration-700 ease-out transform w-[95%] md:w-[44%]" style={{opacity: 1, transform: 'translateY(0px)'}}>
          <h2 className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">OUR STORY</h2>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            This Started With a <em className="font-light italic text-blue-600">Frustrated Search</em> for Help
          </h1>
          <div className="space-y-6 text-gray-600 font-light mb-8 leading-relaxed">
            <p>
              We created this platform after facing the immigration system ourselves. Endless confusion. Unreturned
              emails. Expensive retainers just to ask a single question. We realized how hard it was to find honest,
              licensed advice—especially without risking thousands of dollars up front.
            </p>
            <p>
              So we built what we wished we had: a secure, flexible, transparent platform where anyone can book time
              with a licensed RCIC, get expert advice, and move forward with confidence.
            </p>
          </div>
          <div className="w-fit">
            <Button className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-light lg:block hidden hover:cursor-pointer">
              Learn More
            </Button>
          </div>
        </div>
        <div className="w-[95%] md:w-[56%] border-[1px] border-gray-300 rounded-lg overflow-hidden shadow-md" style={{opacity: 1, transform: 'translateY(0px)'}}>
          <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-100/30 to-transparent"></div>
            <div className="relative z-10 text-center">
              <Users className="h-20 w-20 text-blue-600 mb-4 mx-auto" />
              <span className="text-blue-800 text-lg font-medium">Immigration Success Stories</span>
            </div>
          </div>
        </div>
      </section>

      {/* What We Stand For Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">OUR VALUES</h2>
            <h3 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
              What We Stand For
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">Four pillars that guide everything we do</p>
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
              <Card
                key={index}
                className="bg-white border border-gray-200 rounded-2xl text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${pillar.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}
                  >
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{pillar.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-light">{pillar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Help Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">WHO WE SERVE</h2>
            <h3 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
              Built for <em className="font-light italic text-blue-600">People Like You</em>
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Whether it's your first application or your fifth, we're here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🎓",
                title: "International Students",
                question: "Should I switch to PGWP now or wait?",
                bgColor: "from-blue-50 to-blue-100",
              },
              {
                icon: "🧑‍🤝‍🧑",
                title: "Spousal Applicants",
                question: "Are my relationship docs strong enough?",
                bgColor: "from-pink-50 to-purple-100",
              },
              {
                icon: "💼",
                title: "Workers",
                question: "Can I apply for PR under Express Entry yet?",
                bgColor: "from-green-50 to-emerald-100",
              },
              {
                icon: "🏡",
                title: "Families & Sponsors",
                question: "How do I bring my parents here safely?",
                bgColor: "from-orange-50 to-red-100",
              },
            ].map((persona, index) => (
              <Card
                key={index}
                className="bg-white border border-gray-200 rounded-2xl text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${persona.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                    {persona.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{persona.title}</h3>
                  <p className="text-gray-600 italic font-light">"{persona.question}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* RCICs You Can Trust Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">OUR EXPERTS</h2>
            <h3 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-8">
              <em className="font-light italic text-blue-600">RCICs</em> You Can Trust
            </h3>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed font-light">
              Our consultants are all licensed members of the College of Immigration and Citizenship Consultants (CICC).
              They bring years of practical experience and a client-first mindset. You'll see their license number,
              specialty areas, languages spoken, and availability right on their profile.
            </p>
            <Button
              className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
            >
              Meet Our RCICs
            </Button>
          </div>
        </div>
      </section>

      {/* Our Promise Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">OUR PROMISE</h2>
            <h3 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-8">
              Safe. Private. <em className="font-light italic text-blue-600">On Your Terms.</em>
            </h3>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed font-light">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{promise.title}</h3>
                  <p className="text-gray-600 font-light">{promise.description}</p>
                </div>
              ))}
            </div>

            <Button
              className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            The easiest way to get licensed Canadian immigration help—no stress, no surprises.
          </p>
        </div>
      </section>
    </div>
  )
}
