import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from './Button'
import { Menu } from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [location.pathname])

  const isActive = (path: string) => location.pathname === path

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/20"
          : "bg-white/90 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg group-hover:shadow-xl transition-all duration-300"></div>
              <div className="absolute inset-1 rounded-lg bg-white flex items-center justify-center">
                <span className="text-blue-600 font-black text-lg">IC</span>
              </div>
            </div>
            <span className="font-black text-2xl text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
              ImmigrationConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              to="/about"
              className={`transition-all duration-300 hover:text-blue-600 font-medium ${
                isActive("/about") ? "text-blue-600" : "text-gray-700"
              }`}
            >
              About
            </Link>
            <Link
              to="/services"
              className={`transition-all duration-300 hover:text-blue-600 font-medium ${
                isActive("/services") ? "text-blue-600" : "text-gray-700"
              }`}
            >
              Services
            </Link>
            <Link
              to="/consultants"
              className={`transition-all duration-300 hover:text-blue-600 font-medium ${
                isActive("/consultants") ? "text-blue-600" : "text-gray-700"
              }`}
            >
              Find a Consultant
            </Link>
            <Link
              to="/faq"
              className={`transition-all duration-300 hover:text-blue-600 font-medium ${
                isActive("/faq") ? "text-blue-600" : "text-gray-700"
              }`}
            >
              FAQs
            </Link>
            <Link to="/waiting-list">
              <Button
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-full px-6"
              >
                Join Waitlist
              </Button>
            </Link>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6">Login</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden transition-all duration-300 p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-200/20">
            <div className="flex flex-col space-y-4">
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-4 rounded-lg hover:bg-blue-50 font-medium text-left"
              >
                About
              </Link>
              <Link
                to="/services"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-4 rounded-lg hover:bg-blue-50 font-medium text-left"
              >
                Services
              </Link>
              <Link
                to="/consultants"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-4 rounded-lg hover:bg-blue-50 font-medium text-left"
              >
                Find a Consultant
              </Link>
              <Link
                to="/faq"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-4 rounded-lg hover:bg-blue-50 font-medium text-left"
              >
                FAQs
              </Link>
              <Link to="/waiting-list">
                <Button
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full mt-4 font-semibold w-full"
                >
                  Join Waitlist
                </Button>
              </Link>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
