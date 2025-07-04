import React from 'react'
import { Mail, Linkedin, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600"></div>
                <div className="absolute inset-1 rounded-lg bg-white flex items-center justify-center">
                  <span className="text-blue-600 font-black text-lg">IC</span>
                </div>
              </div>
              <span className="font-black text-xl text-white">ImmigrationConnect</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Your trusted platform for licensed Canadian immigration advice.
            </p>
            <div className="flex space-x-4">
              <button
                type="button"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-all duration-300"
              >
                <Linkedin className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-all duration-300"
              >
                <Instagram className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-white">Quick Links</h3>
            <div className="space-y-3">
              {[
                { name: "About", href: "/about" },
                { name: "Services", href: "/services" },
                { name: "FAQ", href: "/faq" },
                { name: "Join Waitlist", href: "#" },
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="block text-gray-400 hover:text-blue-400 transition-colors duration-300"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-white">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-5 w-5" />
                <span>support@immigrationconnect.ca</span>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-white">Legal</h3>
            <div className="space-y-3">
              <a href="/privacy" className="block text-gray-400 hover:text-blue-400 transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="/terms" className="block text-gray-400 hover:text-blue-400 transition-colors duration-300">
                Terms of Use
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-center md:text-left">
              &copy; 2024 ImmigrationConnect. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
