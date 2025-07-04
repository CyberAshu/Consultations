import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Input } from '../ui/Input'
import { Mail, Lock, AlertCircle, LogIn, Eye, EyeOff, Shield, Users, FileText } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Dummy authentication
    const credentials = {
      'admin@gmail.com': { password: 'pass@123', role: 'admin', redirect: '/admin-dashboard' },
      'client@gmail.com': { password: 'pass@123', role: 'client', redirect: '/client-dashboard' },
      'rcic@gmail.com': { password: 'pass@123', role: 'rcic', redirect: '/rcic-dashboard' }
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = credentials[email as keyof typeof credentials]
    
    if (user && user.password === password) {
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify({
        email,
        role: user.role,
        isAuthenticated: true
      }))
      
      // Redirect to appropriate dashboard
      navigate(user.redirect)
    } else {
      setError('Invalid email or password')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full shadow-lg animate-float">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 animate-slide-in-left">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 animate-slide-in-right">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/80 card-professional animate-fade-in">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="animate-slide-in-left">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200 input-enhanced"
                      placeholder="Enter your email address"
                    />
                    <Mail className="h-5 w-5 text-gray-400 absolute left-4 top-3.5 transition-colors duration-200" />
                  </div>
                </div>

                <div className="animate-slide-in-right">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200 input-enhanced"
                      placeholder="Enter your password"
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-4 top-3.5 transition-colors duration-200" />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 focus:scale-105 animate-glow"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center mb-3">
                <Users className="h-4 w-4 text-gray-500 mr-2" />
                <h4 className="text-sm font-semibold text-gray-700">Demo Credentials</h4>
              </div>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-blue-800">Admin Access</span>
                    <Shield className="h-3 w-3 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-700 mt-1">admin@gmail.com / pass@123</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-green-800">Client Access</span>
                    <Users className="h-3 w-3 text-green-600" />
                  </div>
                  <p className="text-xs text-green-700 mt-1">client@gmail.com / pass@123</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-purple-800">RCIC Access</span>
                    <FileText className="h-3 w-3 text-purple-600" />
                  </div>
                  <p className="text-xs text-purple-700 mt-1">rcic@gmail.com / pass@123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Secure login powered by modern authentication
          </p>
        </div>
      </div>
    </div>
  )
}
