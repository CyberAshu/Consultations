import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { Menu, User, LogOut, ChevronDown } from 'lucide-react'

export function Header() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<{email: string, role: string, isAuthenticated: boolean} | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Check for user authentication
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false)
        setIsUserMenuOpen(false)
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleResize)
    document.addEventListener("click", handleClickOutside)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [location.pathname])

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setIsUserMenuOpen(false)
    navigate('/login')
  }

  const getUserDisplayName = () => {
    if (!user) return ''
    const emailPart = user.email.split('@')[0]
    return emailPart.charAt(0).toUpperCase() + emailPart.slice(1)
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'admin': return '/admin-dashboard'
      case 'client': return '/client-dashboard'
      case 'rcic': return '/rcic-dashboard'
      default: return '/login'
    }
  }

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
            
            {/* User Authentication Section */}
            {user ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-full px-3 sm:px-4 py-2 transition-colors duration-200"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">{getUserDisplayName()}</span>
                  <span className="sm:hidden text-xs font-medium">{getUserDisplayName().charAt(0)}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 transform transition-all duration-200 ease-out origin-top-right scale-100 opacity-100">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role} Account</p>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Dashboard
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6">Login</Button>
              </Link>
            )}
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
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join Waitlist
                </Button>
              </Link>
              
              {/* Mobile User Authentication */}
              {user ? (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Link to={getDashboardLink()}>
                    <Button
                      variant="outline"
                      className="w-full mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold w-full flex items-center justify-center gap-2"
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleLogout()
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold w-full mt-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
