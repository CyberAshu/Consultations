import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../shared/Button'
import { CardContent } from '../ui/Card'
import { Input } from '../ui/Input'
import { authService } from '../../services/authService'
import { Mail, Lock, User as UserIcon, AlertCircle, UserPlus } from 'lucide-react'

export function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      setLoading(true)
      // Default role as client
      const response = await authService.register({ email, password, full_name: fullName, role: 'client' })
      // Redirect based on role, but by default it's client
      switch (response.user.role) {
        case 'admin':
          navigate('/admin-dashboard')
          break
        case 'rcic':
          navigate('/rcic-dashboard')
          break
        case 'client':
        default:
          navigate('/client-dashboard')
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200" />
        <div className="absolute inset-0 bg-white/40 z-10" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-black p-3 rounded-full shadow-lg">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">Join and book your first consultation in minutes</p>
        </div>

        <CardContent>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 p-8">
            <form onSubmit={handleRegister} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full name
                  </label>
                  <div className="relative">
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-12 h-12 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Jane Doe"
                    />
                    <UserIcon className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
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
                      className="pl-12 h-12 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="you@example.com"
                    />
                    <Mail className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-12 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Create a strong password"
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-12 h-12 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Re-enter your password"
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create account
                  </div>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">Sign in</Link>
              </div>
            </form>
          </div>
        </CardContent>
      </div>
    </div>
  )
}


