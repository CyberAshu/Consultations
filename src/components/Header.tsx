import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { Menu, User, LogOut, ChevronDown, Lock } from 'lucide-react'

export function Header() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up')
  const [lastScrollY, setLastScrollY] = useState(0)
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
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const scrollThreshold = 10 // Minimum scroll distance to trigger changes
          
          // Update scroll state
          setIsScrolled(currentScrollY > scrollThreshold)
          
          // Determine scroll direction
          if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
            setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up')
            setLastScrollY(currentScrollY)
          }
          
          ticking = false
        })
        ticking = true
      }
    }

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false)
        setIsUserMenuOpen(false)
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.user-menu-container') && !target.closest('.mobile-menu')) {
        setIsUserMenuOpen(false)
        setIsMenuOpen(false)
      }
    }

    // Passive event listeners for better performance
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize, { passive: true })
    document.addEventListener("click", handleClickOutside)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("click", handleClickOutside)
    }
  }, [lastScrollY])

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

  const handleConsultantLink = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      // Show login prompt and redirect to login
      const confirmed = window.confirm(
        "You need to be logged in to access the consultant directory. Would you like to log in now?"
      )
      if (confirmed) {
        navigate('/login')
      }
    }
    // If user is logged in, the Link will work normally
  }

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-white shadow-xl border-b border-gray-100"
          : "bg-white shadow-lg"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-lg bg-gray-600 shadow-lg group-hover:shadow-xl transition-all duration-300"></div>
              <div className="absolute inset-1 rounded-lg bg-white flex items-center justify-center">
                <span className="text-gray-600 font-black text-lg">IC</span>
              </div>
            </div>
            <span className="font-black text-2xl text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
              ImmigrationConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              to="/about"
              className={`transition-all duration-300 hover:text-gray-600 font-medium ${
                isActive("/about") ? "text-blue-600" : "text-gray-700"
              }`}
            >
              About
            </Link>
            <Link
              to="/services"
              className={`transition-all duration-300 hover:text-gray-600 font-medium ${
                isActive("/services") ? "text-blue-600" : "text-gray-700"
              }`}
            >
              Services
            </Link>
            <Link
              to="/consultants"
              onClick={handleConsultantLink}
              className={`transition-all duration-300 hover:text-gray-600 font-medium ${
                isActive("/consultants") ? "text-blue-600" : "text-gray-700"
              } ${!user ? 'relative' : ''}`}
            >
              <span className="flex items-center gap-1">
                Find a Consultant
                {!user && <Lock className="h-3 w-3 text-gray-400" />}
              </span>
            </Link>
            <Link
              to="/faq"
              className={`transition-all duration-300 hover:text-gray-600 font-medium ${
                isActive("/faq") ? "text-blue-600" : "text-gray-700"
              }`}
            >
              FAQs
            </Link>
            <Link
              to="/blog"
              className={`transition-all duration-300 hover:text-gray-600 font-medium ${
                isActive("/blog") ? "text-blue-600" : "text-gray-700"
              }`}
            >
              Blog
            </Link>
            <Link to="/become-consultant">
              <Button
                variant="outline"
                className="border-2 border-gray-600 text-gray-700 hover:bg-gray-600 font-semibold rounded-full px-6"
              >
                Become a Consultant
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
                <Button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-full px-6">Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden transition-all duration-300 p-2 rounded-lg text-gray-700 hover:bg-gray-100 ${
              isMenuOpen ? 'bg-gray-100' : ''
            }`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsMenuOpen(!isMenuOpen)
            }}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            type="button"
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu lg:hidden mt-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-200/20">
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
                onClick={handleConsultantLink}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-4 rounded-lg hover:bg-blue-50 font-medium text-left"
              >
                <span className="flex items-center gap-2">
                  Find a Consultant
                  {!user && <Lock className="h-4 w-4 text-gray-400" />}
                </span>
              </Link>
              <Link
                to="/faq"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-4 rounded-lg hover:bg-blue-50 font-medium text-left"
              >
                FAQs
              </Link>
              <Link
                to="/blog"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-4 rounded-lg hover:bg-blue-50 font-medium text-left"
              >
                Blog
              </Link>
              <Link to="/become-consultant">
                <Button
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full mt-4 font-semibold w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Become a Consultant
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
