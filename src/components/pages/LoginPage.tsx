import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../Button'
import { Card, CardContent } from '../ui/Card'
import { Input } from '../ui/Input'
import { Mail, Lock, AlertCircle, LogIn } from 'lucide-react'

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your email"
                  />
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your password"
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign in
                  </div>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Demo Credentials:</h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Admin:</strong> admin@gmail.com / pass@123
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Client:</strong> client@gmail.com / pass@123
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>RCIC:</strong> rcic@gmail.com / pass@123
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
